export function base64ToUint8Array(base64: string): Uint8Array {
  const buffer = Buffer.from(base64, "base64");
  return new Uint8Array(buffer);
}
