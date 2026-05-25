export function validateAuMobile(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Enter your mobile number to receive a verification code.";
  }

  if (!/^\d+$/.test(trimmed)) {
    return "Only numbers are allowed in this field.";
  }

  const isLikelyAuNumber = /^(04\d{8}|614\d{8})$/.test(trimmed);

  if (!isLikelyAuNumber) {
    return "Enter a valid AU mobile number, for example 0412345678 or 61412345678.";
  }

  return null;
}

export function maskAuMobileForDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  let local = "";

  if (/^04\d{8}$/.test(digits)) {
    local = digits;
  } else if (/^614\d{8}$/.test(digits)) {
    local = `0${digits.slice(2)}`;
  }

  if (!local) {
    return "+61 4xx xxx xxx";
  }

  return `+61 ${local[1] ?? "4"}xx xxx xxx`;
}
