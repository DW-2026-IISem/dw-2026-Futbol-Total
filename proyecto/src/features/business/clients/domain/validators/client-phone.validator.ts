export function isValidPhone(phone: string): boolean {
  return /^[+]?([\d\s()-]){7,20}$/.test(phone);
}