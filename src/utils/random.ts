import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique ID using UUID and product/variant details
 * @param {string} name - Product name
 * @param {string} [color] - Variant color (optional)
 * @returns {string} Unique ID
 */
export function generateUniqueId(name: string, color?: string): string {
    console.log(name);
    console.log(color);
  const sanitizedName = name.replace(/\s+/g, "-").toLowerCase(); // Replace spaces with dashes
  const uniqueId = uuidv4().split("-")[0]; // Extract first segment of UUID

  if (color) {
    const sanitizedColor = color.replace(/\s+/g, "-").toLowerCase();
    return `${sanitizedName}-${sanitizedColor}-${uniqueId}`;
  }

  return `${sanitizedName}-${uniqueId}`;
}
