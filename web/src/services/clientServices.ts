import { api } from "./api";

export type Client = {
  id: string;
  name: string;
  email: string;
  img: string | null;
};

export async function listClients(): Promise<Client[]> {
  const response = await api.get("/clients");
  return response.data;
}

export async function updateClient(
  id: string,
  data: { name: string; email: string },
): Promise<Client> {
  const response = await api.patch(`/clients/${id}`, data);
  return response.data;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
