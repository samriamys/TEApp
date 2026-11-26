export function randomHex(length: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, saltHex: string, iterations: number): Promise<string> {
  const salt = Uint8Array.from(saltHex.match(/../g) ?? [], value => parseInt(value, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}
