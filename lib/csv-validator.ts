/**
 * CSV Validation Utilities for Bulk Upload
 */

export interface ValidationError {
    row?: number
    field?: string
    message: string
    severity: 'error' | 'warning'
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
}

export interface CSVPost {
    title: string
    content: string
    excerpt: string
    category: string
    status: string
    imageUrl: string
    tags: string
}

// Configuration constants
export const CSV_LIMITS = {
    MAX_FILE_SIZE_MB: 5,
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    MAX_ROWS: 500,
    MIN_CONTENT_LENGTH: 100,
    MAX_TITLE_LENGTH: 200,
    MAX_EXCERPT_LENGTH: 300,
    MAX_TAGS: 10,
}

const REQUIRED_COLUMNS = ['title', 'content', 'excerpt', 'category', 'status', 'imageUrl', 'tags']
const VALID_STATUSES = ['draft', 'published']

/**
 * Validate file size before parsing
 */
export function validateFileSize(file: File): ValidationResult {
    const errors: ValidationError[] = []

    if (file.size === 0) {
        errors.push({
            message: 'File is empty',
            severity: 'error'
        })
    }

    if (file.size > CSV_LIMITS.MAX_FILE_SIZE_BYTES) {
        errors.push({
            message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${CSV_LIMITS.MAX_FILE_SIZE_MB}MB`,
            severity: 'error'
        })
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings: []
    }
}

/**
 * Validate CSV structure (headers and row count)
 */
export function validateCSVStructure(
    data: any[],
    headers?: string[]
): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Check if data is empty
    if (!data || data.length === 0) {
        errors.push({
            message: 'CSV file contains no data rows',
            severity: 'error'
        })
        return { isValid: false, errors, warnings }
    }

    // Validate headers
    if (headers) {
        const missingHeaders = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
        if (missingHeaders.length > 0) {
            errors.push({
                message: `Missing required columns: ${missingHeaders.join(', ')}`,
                severity: 'error'
            })
        }

        // Check for duplicate headers
        const duplicates = headers.filter((item, index) => headers.indexOf(item) !== index)
        if (duplicates.length > 0) {
            errors.push({
                message: `Duplicate column names found: ${[...new Set(duplicates)].join(', ')}`,
                severity: 'error'
            })
        }
    }

    // Check row count
    if (data.length > CSV_LIMITS.MAX_ROWS) {
        errors.push({
            message: `CSV contains ${data.length} rows, which exceeds the maximum of ${CSV_LIMITS.MAX_ROWS} rows`,
            severity: 'error'
        })
    }

    // Warning for large files
    if (data.length > 100) {
        warnings.push({
            message: `Large upload detected (${data.length} rows). This may take several minutes to process.`,
            severity: 'warning'
        })
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Validate a single post row
 */
export function validatePostRow(row: CSVPost, rowNumber: number): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Title validation
    if (!row.title || row.title.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'title',
            message: 'Title is required',
            severity: 'error'
        })
    } else if (row.title.length > CSV_LIMITS.MAX_TITLE_LENGTH) {
        errors.push({
            row: rowNumber,
            field: 'title',
            message: `Title exceeds maximum length of ${CSV_LIMITS.MAX_TITLE_LENGTH} characters`,
            severity: 'error'
        })
    }

    // Content validation
    if (!row.content || row.content.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'content',
            message: 'Content is required',
            severity: 'error'
        })
    } else if (row.content.length < CSV_LIMITS.MIN_CONTENT_LENGTH) {
        warnings.push({
            row: rowNumber,
            field: 'content',
            message: `Content is very short (${row.content.length} characters). Recommended minimum is ${CSV_LIMITS.MIN_CONTENT_LENGTH} characters.`,
            severity: 'warning'
        })
    }

    // Excerpt validation
    if (row.excerpt && row.excerpt.length > CSV_LIMITS.MAX_EXCERPT_LENGTH) {
        errors.push({
            row: rowNumber,
            field: 'excerpt',
            message: `Excerpt exceeds maximum length of ${CSV_LIMITS.MAX_EXCERPT_LENGTH} characters`,
            severity: 'error'
        })
    }

    // Category validation
    if (!row.category || row.category.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'category',
            message: 'Category is required',
            severity: 'error'
        })
    }

    // Status validation
    if (row.status && !VALID_STATUSES.includes(row.status.toLowerCase())) {
        errors.push({
            row: rowNumber,
            field: 'status',
            message: `Invalid status "${row.status}". Must be "draft" or "published"`,
            severity: 'error'
        })
    }

    // Image URL validation
    if (row.imageUrl && row.imageUrl.trim() !== '') {
        try {
            new URL(row.imageUrl)
        } catch {
            errors.push({
                row: rowNumber,
                field: 'imageUrl',
                message: 'Invalid URL format',
                severity: 'error'
            })
        }
    }

    // Tags validation
    if (row.tags) {
        const tagArray = row.tags.split(',').map(t => t.trim()).filter(t => t !== '')
        if (tagArray.length > CSV_LIMITS.MAX_TAGS) {
            errors.push({
                row: rowNumber,
                field: 'tags',
                message: `Too many tags (${tagArray.length}). Maximum is ${CSV_LIMITS.MAX_TAGS}`,
                severity: 'error'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Validate all rows in the CSV
 */
export function validateAllRows(data: CSVPost[]): ValidationResult {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationError[] = []

    data.forEach((row, index) => {
        const result = validatePostRow(row, index + 1) // Row numbers are 1-indexed
        allErrors.push(...result.errors)
        allWarnings.push(...result.warnings)
    })

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    }
}

/**
 * Generate a CSV error report
 */
export function generateErrorReport(errors: ValidationError[]): string {
    if (errors.length === 0) {
        return 'No errors found'
    }

    const lines = ['Row,Field,Error']

    errors.forEach(error => {
        const row = error.row ? error.row.toString() : 'N/A'
        const field = error.field || 'General'
        const message = error.message.replace(/,/g, ';') // Escape commas
        lines.push(`${row},${field},"${message}"`)
    })

    return lines.join('\n')
}

/**
 * Download error report as CSV file
 */
export function downloadErrorReport(errors: ValidationError[], filename: string = 'upload-errors.csv') {
    const csvContent = generateErrorReport(errors)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

/**
 * Format validation summary for display
 */
export function formatValidationSummary(result: ValidationResult): string {
    const parts: string[] = []

    if (result.errors.length > 0) {
        parts.push(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`)
    }

    if (result.warnings.length > 0) {
        parts.push(`${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`)
    }

    if (parts.length === 0) {
        return 'All validations passed'
    }

    return parts.join(', ')
}
