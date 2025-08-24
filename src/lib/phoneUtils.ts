export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 0 and is 11 digits (Nigerian local format)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+234${cleaned.substring(1)}`;
  }
  
  // If it's already in international format
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it's 10 digits (Nigerian without leading 0)
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    return `+234${cleaned}`;
  }
  
  // Return as is for other formats
  return cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  
  // Check if it's a valid Nigerian number (+234 followed by 10 digits)
  const nigerianPattern = /^\+234\d{10}$/;
  
  // General international format check
  const internationalPattern = /^\+\d{10,15}$/;
  
  return nigerianPattern.test(formatted) || internationalPattern.test(formatted);
};

export const displayPhoneNumber = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  
  // For Nigerian numbers, show in a readable format
  if (formatted.startsWith('+234')) {
    const number = formatted.substring(4);
    return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }
  
  return formatted;
};