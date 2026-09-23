const API_BASE_URL = import.meta.env.VITE_API_URL;

export function getAssetUrl(fileName?: string) {
  if (!fileName) return undefined;
  if (fileName.startsWith("http")) return fileName;
  return `${API_BASE_URL}/uploads/${fileName}`;
}
