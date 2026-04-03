import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isQuillContentEmpty(html: string) {
  if (!html) return true

  const hasEmbeds = /<(img|video|audio|iframe)\b/i.test(html)
  if (hasEmbeds) return false

  const plainText = html
    .replace(/<p><br><\/p>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim()

  return plainText.length === 0
}
