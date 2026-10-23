export const MOBILE_NUMBER_ERROR =
  "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.";

export function isValidMobileNumber(value: string | null | undefined) {
  if (!value?.trim()) return false;
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(?:\+91|91)?[6-9]\d{9}$/.test(normalized);
}

export function isOptionalMobileNumber(value: string | null | undefined) {
  return !value?.trim() || isValidMobileNumber(value);
}
