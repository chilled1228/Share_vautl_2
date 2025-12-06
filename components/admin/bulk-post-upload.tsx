'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { revalidateAfterPostChange } from '@/lib/blog-actions'
import {
    validateFileSize,
    validateCSVStructure,
    validateAllRows,
    downloadErrorReport,
    formatValidationSummary,
    CSVPost,
    ValidationError,
    CSV_LIMITS
} from '@/lib/csv-validator'

interface UploadResult {
    title: string
    status: 'success' | 'error'
    message?: string
    rowNumber?: number
    data?: CSVPost
}

export default function BulkPostUpload({ user }: { user: any }) {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [parsing, setParsing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<UploadResult[]>([])
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([])
    const [error, setError] = useState('')
    const [parsedData, setParsedData] = useState<CSVPost[]>([])
    const [canProceed, setCanProceed] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            // Validate file extension
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                setError('Please select a CSV file')
                return
            }

            // Validate file size
            const sizeValidation = validateFileSize(selectedFile)
            if (!sizeValidation.isValid) {
                setError(sizeValidation.errors[0].message)
                return
            }

            setFile(selectedFile)
            setError('')
            setResults([])
            setProgress(0)
            setValidationErrors([])
            setValidationWarnings([])
            setParsedData([])
            setCanProceed(false)
        }
    }

    const parseCSV = () => {
        if (!file) return

        setParsing(true)
        setError('')
        setValidationErrors([])
        setValidationWarnings([])

        Papa.parse<CSVPost>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                setParsing(false)

                // Check for parsing errors
                if (results.errors.length > 0) {
                    const parsingError = results.errors[0]
                    setError(`CSV parsing error at row ${parsingError.row}: ${parsingError.message}`)
                    return
                }

                // Validate CSV structure
                const structureValidation = validateCSVStructure(results.data, results.meta.fields)
                if (!structureValidation.isValid) {
                    setError(structureValidation.errors[0].message)
                    setValidationErrors(structureValidation.errors)
                    return
                }

                // Store warnings from structure validation
                if (structureValidation.warnings.length > 0) {
                    setValidationWarnings(structureValidation.warnings)
                }

                // Validate all rows
                const rowValidation = validateAllRows(results.data)

                if (!rowValidation.isValid) {
                    setValidationErrors(rowValidation.errors)
                    setValidationWarnings([...structureValidation.warnings, ...rowValidation.warnings])
                    setError(`Found ${rowValidation.errors.length} validation error(s). Please fix them before uploading.`)
                    return
                }

                // Store warnings
                setValidationWarnings([...structureValidation.warnings, ...rowValidation.warnings])

                // Store parsed data and allow proceeding
                setParsedData(results.data)
                setCanProceed(true)
            },
            error: (error) => {
                setParsing(false)
                setError(`Error reading file: ${error.message}`)
            }
        })
    }

    const uploadPosts = async (posts: CSVPost[]) => {
        setUploading(true)
        const uploadResults: UploadResult[] = []
        const successfulPosts: { slug: string; category: string }[] = []
        let completed = 0

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            const rowNumber = i + 1

            try {
                // Additional runtime validation
                if (!post.title || !post.content) {
                    throw new Error('Title and Content are required')
                }

                const postData = {
                    title: post.title.trim(),
                    content: post.content.trim(),
                    excerpt: post.excerpt?.trim() || '',
                    category: post.category?.trim() || 'Uncategorized',
                    status: ['draft', 'published'].includes(post.status?.toLowerCase()) ? post.status.toLowerCase() : 'draft',
                    imageUrl: post.imageUrl?.trim() || '',
                    tags: post.tags ? post.tags.split(',').map(t => t.trim()).filter(t => t !== '') : [],
                    authorId: user.uid,
                    authorEmail: user.email,
                    authorName: user.displayName || user.email,
                    slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    published: post.status?.toLowerCase() === 'published',
                    views: 0,
                    featured: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                }

                await addDoc(collection(db, 'posts'), postData)

                // Track successful posts for batch revalidation
                successfulPosts.push({
                    slug: postData.slug,
                    category: postData.category
                })

                uploadResults.push({
                    title: post.title,
                    status: 'success',
                    rowNumber
                })
            } catch (err) {
                console.error(`Error uploading post "${post.title}" (row ${rowNumber}):`, err)
                uploadResults.push({
                    title: post.title || `Row ${rowNumber}`,
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Unknown error',
                    rowNumber,
                    data: post
                })
            }

            completed++
            setProgress((completed / posts.length) * 100)
            setResults([...uploadResults])
        }

        // Batch revalidate all successful posts at the end
        if (successfulPosts.length > 0) {
            try {
                console.log(`Revalidating cache for ${successfulPosts.length} posts...`)
                await Promise.all(
                    successfulPosts.map(({ slug, category }) =>
                        revalidateAfterPostChange(slug, category).catch(err => {
                            console.error(`Failed to revalidate ${slug}:`, err)
                            // Don't fail the entire upload if revalidation fails
                            return Promise.resolve()
                        })
                    )
                )
            } catch (err) {
                console.error('Batch revalidation error:', err)
                // Continue even if revalidation fails
            }
        }

        setUploading(false)
        setCanProceed(false)
    }

    const retryFailedUploads = () => {
        const failedPosts = results
            .filter(r => r.status === 'error' && r.data)
            .map(r => r.data!)

        if (failedPosts.length > 0) {
            setResults([])
            setProgress(0)
            uploadPosts(failedPosts)
        }
    }

    const handleDownloadErrors = () => {
        if (validationErrors.length > 0) {
            downloadErrorReport(validationErrors, 'validation-errors.csv')
        } else {
            const uploadErrors = results
                .filter(r => r.status === 'error')
                .map(r => ({
                    row: r.rowNumber,
                    field: 'Upload',
                    message: r.message || 'Unknown error',
                    severity: 'error' as const
                }))

            if (uploadErrors.length > 0) {
                downloadErrorReport(uploadErrors, 'upload-errors.csv')
            }
        }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    const hasErrors = validationErrors.length > 0 || errorCount > 0

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()} className="brutalist-border">
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">Bulk Post Upload</h1>
            </div>

            <Card className="brutalist-border brutalist-shadow">
                <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Maximum file size: {CSV_LIMITS.MAX_FILE_SIZE_MB}MB | Maximum rows: {CSV_LIMITS.MAX_ROWS}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csv-upload"
                                disabled={uploading || parsing}
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload size={40} className="text-muted-foreground" />
                                <span className="text-lg font-medium">
                                    {file ? file.name : 'Click to select CSV file'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Required columns: title, content, excerpt, category, status, imageUrl, tags
                                </span>
                            </label>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {validationWarnings.length > 0 && !error && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warnings</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-1 mt-2">
                                        {validationWarnings.slice(0, 3).map((warning, idx) => (
                                            <div key={idx} className="text-sm">
                                                {warning.row && `Row ${warning.row}: `}{warning.message}
                                            </div>
                                        ))}
                                        {validationWarnings.length > 3 && (
                                            <div className="text-sm font-medium">
                                                ...and {validationWarnings.length - 3} more warning(s)
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {validationErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                                        {validationErrors.slice(0, 5).map((error, idx) => (
                                            <div key={idx} className="text-sm">
                                                {error.row && `Row ${error.row}`}
                                                {error.field && ` - ${error.field}`}: {error.message}
                                            </div>
                                        ))}
                                        {validationErrors.length > 5 && (
                                            <div className="text-sm font-medium">
                                                ...and {validationErrors.length - 5} more error(s)
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={handleDownloadErrors}
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download Error Report
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {file && !uploading && !parsing && !canProceed && results.length === 0 && (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    parseCSV()
                                }}
                                className="w-full bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                <FileText className="mr-2" size={20} />
                                Validate CSV
                            </Button>
                        )}

                        {canProceed && !uploading && (
                            <div className="space-y-3">
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Validation Passed</AlertTitle>
                                    <AlertDescription>
                                        Found {parsedData.length} valid post(s) ready to upload.
                                        {validationWarnings.length > 0 && ` (${validationWarnings.length} warning(s))`}
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        uploadPosts(parsedData)
                                    }}
                                    disabled={uploading}
                                    className="w-full bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                >
                                    <Upload className="mr-2" size={20} />
                                    Start Upload ({parsedData.length} posts)
                                </Button>
                            </div>
                        )}

                        {(uploading || parsing) && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{parsing ? 'Validating CSV...' : `Uploading posts... (${successCount + errorCount}/${parsedData.length})`}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Upload Results</h3>
                                <div className="text-sm text-muted-foreground">
                                    <span className="text-green-600 font-medium">{successCount} successful</span>
                                    {errorCount > 0 && (
                                        <>
                                            {' • '}
                                            <span className="text-red-600 font-medium">{errorCount} failed</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-4">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-md border ${result.status === 'success'
                                            ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20'
                                            : 'bg-red-50/50 border-red-200 dark:bg-red-950/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {result.status === 'success' ? (
                                                <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                                            ) : (
                                                <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium block truncate">{result.title}</span>
                                                {result.rowNumber && (
                                                    <span className="text-xs text-muted-foreground">Row {result.rowNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                        {result.message && (
                                            <span className="text-sm text-red-500 ml-2">{result.message}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!uploading && (
                                <div className="flex gap-2">
                                    {errorCount > 0 && (
                                        <>
                                            <Button
                                                onClick={retryFailedUploads}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <RefreshCw size={16} className="mr-2" />
                                                Retry Failed ({errorCount})
                                            </Button>
                                            <Button
                                                onClick={handleDownloadErrors}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Download Errors
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={() => {
                                            setFile(null)
                                            setResults([])
                                            setProgress(0)
                                            setValidationErrors([])
                                            setValidationWarnings([])
                                            setParsedData([])
                                            setCanProceed(false)
                                        }}
                                        variant="outline"
                                        className={errorCount > 0 ? '' : 'w-full'}
                                    >
                                        Upload Another File
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
