import { api } from "./api";

export type Technician = {
  id: string;
  name: string;
  email: string;
  img: string | null;
  availability: {
    workTime: string[];
  };
};

export async function listTechnicians(): Promise<Technician[]> {
  const response = await api.get("/technicians");
  return response.data;
}

export async function getTechnician(id: string): Promise<Technician> {
  const response = await api.get(`/technicians/${id}`);
  return response.data;
}

export async function createTechnician(data: {
  name: string;
  email: string;
  password: string;
  workTime: string[];
}) {
  const response = await api.post("/technicians", data);
  return response.data;
}

export async function updateTechnician(
  id: string,
  data: { name: string; email: string; workTime: string[] },
) {
  const response = await api.patch(`/technicians/${id}`, data);
  return response.data;
}
