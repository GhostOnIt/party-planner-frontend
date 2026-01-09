import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) {
    return path;
  }

  const viteApiUrl = import.meta.env.VITE_API_URL as string;
  if (!viteApiUrl) {
    return undefined;
  }

  // Remove /api from the end of the API URL to get the base backend URL
  const backendUrl = viteApiUrl.replace(/\/api\/?$/, '');
  return `${backendUrl}${path}`;
}
