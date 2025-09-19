interface PersonSchemaProps {
  name: string
  jobTitle?: string
  company?: string
  url?: string
  image?: string
  email?: string
  sameAs?: string[]
  description?: string
  birthPlace?: string
  birthDate?: string
  gender?: string
  nationality?: string
}

export default function PersonSchema({
  name,
  jobTitle,
  company,
  url,
  image,
  email,
  sameAs = [],
  description,
  birthPlace,
  birthDate,
  gender,
  nationality
}: PersonSchemaProps) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    ...(jobTitle && { "jobTitle": jobTitle }),
    ...(company && { "worksFor": {
      "@type": "Organization",
      "name": company
    }}),
    ...(url && { "url": url }),
    ...(image && { "image": image }),
    ...(email && { "email": email }),
    ...(sameAs.length > 0 && { "sameAs": sameAs }),
    ...(description && { "description": description }),
    ...(birthPlace && { "birthPlace": birthPlace }),
    ...(birthDate && { "birthDate": birthDate }),
    ...(gender && { "gender": gender }),
    ...(nationality && { "nationality": nationality })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  )
}