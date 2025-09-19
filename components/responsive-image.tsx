import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
}

export default function ResponsiveImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  fill = false,
}: ResponsiveImageProps) {
  const imageProps = fill
    ? {
        fill: true,
        sizes,
      }
    : {
        width,
        height,
        sizes,
      }

  return (
    <div className={cn("relative overflow-hidden brutalist-border", fill && "aspect-video", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        priority={priority}
        className="object-cover w-full h-full"
        {...imageProps}
      />
    </div>
  )
}
