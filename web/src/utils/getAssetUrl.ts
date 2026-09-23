const API_BASE_URL = "http://localhost:3333";

export function getAssetUrl(fileName?: string) {
  if (!fileName) return undefined;
  if (fileName.startsWith("http")) return fileName;
  return `${API_BASE_URL}/uploads/${fileName}`;
}
