import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${path}`;
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string) {
  const parts = name.split(" ");
  let initials = "";
  
  if (parts.length === 1) {
    initials = parts[0].substring(0, 2);
  } else {
    parts.forEach((part) => {
      if (part.length > 0) {
        initials += part[0];
      }
    });
  }
  
  return initials.toUpperCase().substring(0, 2);
} 