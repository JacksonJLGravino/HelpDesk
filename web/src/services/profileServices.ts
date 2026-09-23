import { api } from "./api";

export async function updateProfile(data: {
  name: string;
  email: string;
}): Promise<{ name: string; email: string }> {
  const response = await api.patch("/users", data);
  return response.data;
}

export async function updatePassword(data: {
  oldPassword: string;
  password: string;
}): Promise<void> {
  await api.patch("/users", data);
}
