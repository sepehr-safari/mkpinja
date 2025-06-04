import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBookmarkCount(count: number, hasMore: boolean = false): string {
  if (count > 20 || hasMore) {
    return `+${count}`;
  }
  return count.toString();
}
