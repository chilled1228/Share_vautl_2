/**
 * ImageObject Structured Data Component
 * Provides explicit schema markup for images to improve Google Image indexing
 */

interface ImageObjectSchemaProps {
    imageUrl: string
    title: string
    description: string
    width?: number
    height?: number
    author?: string
    datePublished?: string
}

export function ImageObjectSchema({
    imageUrl,
    title,
    description,
    width = 1200,
    height = 630,
    author = "ShareVault Team",
    datePublished,
}: ImageObjectSchemaProps) {
    // Ensure absolute URL
    const absoluteImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'}${imageUrl}`

    // Determine encoding format from URL
    const encodingFormat = absoluteImageUrl.endsWith('.webp')
        ? 'image/webp'
        : absoluteImageUrl.endsWith('.png')
            ? 'image/png'
            : 'image/jpeg'

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "url": absoluteImageUrl,
        "contentUrl": absoluteImageUrl,
        "name": title,
        "description": description,
        "width": {
            "@type": "QuantitativeValue",
            "value": width,
            "unitCode": "E37" // Pixel
        },
        "height": {
            "@type": "QuantitativeValue",
            "value": height,
            "unitCode": "E37" // Pixel
        },
        "encodingFormat": encodingFormat,
        "uploadDate": datePublished || new Date().toISOString(),
        "author": {
            "@type": "Person",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "name": "ShareVault",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'}/logo.png`
            }
        },
        "license": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'}/terms`,
        "acquireLicensePage": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'}/terms`,
        "creditText": "ShareVault",
        "copyrightNotice": `© ${new Date().getFullYear()} ShareVault. All rights reserved.`
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schemaData)
            }}
        />
    )
}
