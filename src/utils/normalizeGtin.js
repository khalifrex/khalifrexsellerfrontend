
export function normalizeToGTIN14(code) {
  if (!code) return null;
  
  // Strip non-digits
  let digits = code.replace(/\D/g, "");
  
  // Return null if no digits found
  if (digits.length === 0) return null;
  
  // If less than 14 digits, pad left with zeros
  if (digits.length < 14) {
    digits = digits.padStart(14, "0");
  }
  
  // If more than 14 digits, take the last 14 digits
  if (digits.length > 14) {
    digits = digits.slice(-14);
  }
  
  return digits;
}

// Helper function to detect if a search term might be a product code
export function isProductCode(term) {
  if (!term) return false;
  
  // Remove non-digits and check if it's mostly numeric
  const digits = term.replace(/\D/g, "");
  const nonDigits = term.replace(/\d/g, "");
  

  return (
    digits.length >= 8 || 
    (digits.length > nonDigits.length && term.length >= 6)
  );
}