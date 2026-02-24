// Generate booking reference
export const generateBookingRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SFX-${timestamp}-${random}`;
};
