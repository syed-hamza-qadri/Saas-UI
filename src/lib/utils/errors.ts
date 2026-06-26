export const getFriendlyError = (error: Error): string => {
  const msg = error.message;
  if (msg.includes("Insufficient stock")) return msg;
  if (msg.includes("Product not found")) return msg;
  if (msg.includes("duplicate key") && msg.includes("sku")) return "A product with this SKU already exists.";
  if (msg.includes("duplicate key") && msg.includes("phone")) return "A customer with this phone number already exists.";
  if (msg.includes("duplicate key") && msg.includes("email")) return "A customer with this email already exists.";
  if (msg.includes("duplicate key") && msg.includes("order_number")) return "Order number conflict. Please try again.";
  if (msg.includes("violates foreign key")) return "This record is linked to other data and cannot be deleted.";
  if (msg.includes("JWT expired") || msg.includes("not authenticated")) return "Session expired. Please log in again.";
  if (msg.includes("fetch failed") || msg.includes("network")) return "Network error. Please check your connection.";
  return "Something went wrong. Please try again.";
};
