import { api } from "./api";

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.patch("/avatar", formData);

  return response.data.img;
}

export async function deleteAvatar(): Promise<void> {
  await api.delete("/avatar");
}
