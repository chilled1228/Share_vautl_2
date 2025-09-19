import { NextRequest, NextResponse } from 'next/server'
import { CSVParser } from '@/lib/csv-parser'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const csvFile = formData.get('csvFile') as File
    const validateOnly = formData.get('validateOnly') === 'true'

    if (!csvFile) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!csvFile.name.toLowerCase().endsWith('.csv') && csvFile.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (csvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'CSV file size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Read CSV content
    const csvContent = await csvFile.text()

    // For simplicity, we'll allow any authorId for now - the client will validate
    const validAdminIds = ['admin-user-id', 'any-user-id'] // Simplified for testing

    // Parse and validate CSV
    const parseResult = CSVParser.parseCSVToBlogPosts(csvContent, validAdminIds)

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: parseResult.errors,
        warnings: parseResult.warnings,
        validPosts: parseResult.posts.length,
        totalRows: parseResult.posts.length + parseResult.errors.length
      }, { status: 400 })
    }

    // If validation only, return success without creating posts
    if (validateOnly) {
      return NextResponse.json({
        success: true,
        message: 'CSV validation successful',
        warnings: parseResult.warnings,
        validPosts: parseResult.posts.length,
        totalRows: parseResult.posts.length,
        posts: parseResult.posts // Return posts for client-side creation
      })
    }

    // For bulk creation, return the posts to be created on the client side
    return NextResponse.json({
      success: true,
      message: 'CSV parsed successfully - ready for client-side creation',
      warnings: parseResult.warnings,
      posts: parseResult.posts,
      totalRows: parseResult.posts.length
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return sample CSV
    const sampleCSV = CSVParser.generateSampleCSV()

    return new NextResponse(sampleCSV, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="sample-blog-posts.csv"'
      }
    })

  } catch (error) {
    console.error('Sample CSV error:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample CSV' },
      { status: 500 }
    )
  }
}