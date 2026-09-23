import { useAuth } from "./useAuth";
import { NAV_ITEMS_BY_ROLE } from "../config/navigation";

export function useNavItems() {
  const { session } = useAuth();
  const role = session?.user.role;

  return {
    navItems: role ? NAV_ITEMS_BY_ROLE[role] : [],
  };
}
