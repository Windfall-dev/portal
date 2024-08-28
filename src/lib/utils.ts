import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  const buffer = Buffer.from(uint8Array);
  return buffer.toString("base64");
}
