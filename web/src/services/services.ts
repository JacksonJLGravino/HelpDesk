import { api } from "./api";

export type Service = {
  id: string;
  title: string;
  price: string;
  status: "ativo" | "inativo";
};

export async function listServices(): Promise<Service[]> {
  const response = await api.get("/services");
  return response.data;
}

export async function toggleServiceStatus(
  id: string,
  status: "ativo" | "inativo",
): Promise<void> {
  await api.patch(`/services/${id}`, { status });
}

export async function createService(data: {
  title: string;
  price: number;
}): Promise<Service> {
  const response = await api.post("/services", data);
  return response.data;
}
export async function updateService(
  id: string,
  data: { title: string; price: number },
): Promise<Service> {
  const response = await api.patch(`/services/${id}`, data);
  return response.data;
}
