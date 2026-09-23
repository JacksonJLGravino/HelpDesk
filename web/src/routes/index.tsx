import { useAuth } from "../hooks/useAuth";
import { BrowserRouter } from "react-router";
import { AuthRoutes } from "./AuthRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { ClientRoutes } from "./ClientRoutes";
import { TechnicianRoutes } from "./TechnicianRoutes";

export function AppRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  function Routes() {
    switch (session?.user.role) {
      case "admin":
        return <AdminRoutes />;
      case "cliente":
        return <ClientRoutes />;
      case "tecnico":
        return <TechnicianRoutes />;
      default:
        return <AuthRoutes />;
    }
  }

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}
