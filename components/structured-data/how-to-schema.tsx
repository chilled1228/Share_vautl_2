interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

interface HowToSchemaProps {
  name: string
  description: string
  image?: string
  totalTime?: string
  estimatedCost?: {
    currency: string
    value: string
  }
  supply?: string[]
  tool?: string[]
  steps: HowToStep[]
}

export default function HowToSchema({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  supply = [],
  tool = [],
  steps
}: HowToSchemaProps) {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    ...(image && { "image": image }),
    ...(totalTime && { "totalTime": totalTime }),
    ...(estimatedCost && { "estimatedCost": estimatedCost }),
    ...(supply.length > 0 && { "supply": supply }),
    ...(tool.length > 0 && { "tool": tool }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
      ...(step.url && { "url": step.url })
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
  )
}