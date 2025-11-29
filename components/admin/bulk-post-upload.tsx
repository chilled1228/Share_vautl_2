'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { revalidateAfterPostChange } from '@/lib/blog-actions'

interface CSVPost {
    title: string
    content: string
    excerpt: string
    category: string
    status: string
    imageUrl: string
    tags: string
}

interface UploadResult {
    title: string
    status: 'success' | 'error'
    message?: string
}

export default function BulkPostUpload({ user }: { user: any }) {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [parsing, setParsing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<UploadResult[]>([])
    const [error, setError] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setError('')
            setResults([])
            setProgress(0)
        }
    }

    const parseCSV = () => {
        if (!file) return

        setParsing(true)
        Papa.parse<CSVPost>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                setParsing(false)
                if (results.errors.length > 0) {
                    setError(`Error parsing CSV: ${results.errors[0].message}`)
                    return
                }

                // Validate headers
                const headers = results.meta.fields
                const requiredHeaders = ['title', 'content', 'excerpt', 'category', 'status', 'imageUrl', 'tags']
                const missingHeaders = requiredHeaders.filter(h => !headers?.includes(h))

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}`)
                    return
                }

                await uploadPosts(results.data)
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
        let completed = 0

        for (const post of posts) {
            try {
                // Basic validation
                if (!post.title || !post.content) {
                    throw new Error('Title and Content are required')
                }

                const postData = {
                    title: post.title,
                    content: post.content,
                    excerpt: post.excerpt || '',
                    category: post.category || 'Uncategorized',
                    status: ['draft', 'published'].includes(post.status?.toLowerCase()) ? post.status.toLowerCase() : 'draft',
                    imageUrl: post.imageUrl || '',
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
                await revalidateAfterPostChange(postData.slug, postData.category)

                uploadResults.push({ title: post.title, status: 'success' })
            } catch (err) {
                console.error(`Error uploading post "${post.title}":`, err)
                uploadResults.push({
                    title: post.title || 'Unknown Post',
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Unknown error'
                })
            }

            completed++
            setProgress((completed / posts.length) * 100)
            setResults([...uploadResults])
        }

        setUploading(false)
    }

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

                        {file && !uploading && !parsing && results.length === 0 && (
                            <Button
                                onClick={parseCSV}
                                className="w-full bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                <FileText className="mr-2" size={20} />
                                Start Upload
                            </Button>
                        )}

                        {(uploading || parsing) && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{parsing ? 'Parsing CSV...' : 'Uploading posts...'}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Upload Results</h3>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-4">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-md border ${result.status === 'success' ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {result.status === 'success' ? (
                                                <CheckCircle className="text-green-500" size={16} />
                                            ) : (
                                                <AlertCircle className="text-red-500" size={16} />
                                            )}
                                            <span className="font-medium">{result.title}</span>
                                        </div>
                                        {result.message && (
                                            <span className="text-sm text-red-500">{result.message}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {!uploading && (
                                <Button
                                    onClick={() => {
                                        setFile(null)
                                        setResults([])
                                        setProgress(0)
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Upload Another File
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
