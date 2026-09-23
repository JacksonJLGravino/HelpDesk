type UserAPIRole = "admin" | "tecnico" | "cliente";

type UserAPIResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    img?: string;
    role: UserAPIRole;
    createdAt: string;
    updatedAt: string;
    availability?: { workTime: string[] } | null;
  };
};
