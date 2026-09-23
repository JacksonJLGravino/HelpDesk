import { Outlet, useNavigate } from "react-router";
import { DarkLogo } from "../components/DarkLogo";
import { UserMenu } from "../components/UserMenu";
import { CircleUser, LogOut, Menu } from "lucide-react";
import { NavLink } from "react-router";
import {
  DropdownCard,
  type DropdownCardItem,
} from "../components/DropdownCard";
import { useClickOutside } from "../utils/useClickOutside";
import { useState } from "react";
import {
  ProfileModal,
  type ProfileRole,
  type ProfileUser,
} from "../components/ProfileModal";
import { useNavItems } from "../hooks/useNavItens";
import { useAuth } from "../hooks/useAuth";
import { getAssetUrl } from "../utils/getAssetUrl";

export function DashboardLayout() {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const { navItems } = useNavItems();
  const { session, remove } = useAuth();

  const menuNavRef = useClickOutside<HTMLDivElement>(() => setNavOpen(false));
  const menuUserRef = useClickOutside<HTMLDivElement>(() =>
    setUserMenuOpen(false),
  );

  const mobileNavItems: DropdownCardItem[] = navItems.map(
    ({ label, to, icon }) => ({
      label,
      icon: icon as DropdownCardItem["icon"],
      onClick: () => {
        navigate(to);
        setNavOpen(false);
      },
    }),
  );

  const userItems: DropdownCardItem[] = [
    {
      label: "Perfil",
      icon: CircleUser,
      onClick: () => setProfileOpen(true),
      variant: "default",
    },
    {
      label: "Sair",
      icon: LogOut,
      onClick: () => remove(),
      variant: "danger",
    },
  ];

  const role = session!.user.role as ProfileRole;

  const currentUser: ProfileUser = {
    name: session!.user.name,
    email: session!.user.email,
    avatarUrl: getAssetUrl(session!.user.img),
    availability: session!.user.availability?.workTime,
  };

  return (
    <div className="min-h-screen w-full md:flex bg-gray-100">
      <div className="flex items-center justify-between p-6 md:p-0 md:flex-col">
        <div className="flex items-center gap-4 md:flex-col">
          <div className="relative md:hidden" ref={menuNavRef}>
            <button
              className="h-10 w-10 rounded-[5px] bg-gray-200 flex items-center justify-center cursor-pointer"
              onClick={() => setNavOpen((v) => !v)}
            >
              <Menu className="h-5 w-5 text-white" />
            </button>

            {isNavOpen && (
              <div className="absolute left-0 top-12 z-50">
                <DropdownCard title="Navegação" items={mobileNavItems} />
              </div>
            )}
          </div>

          <DarkLogo text={session?.user.role} />

          <nav className="hidden md:flex md:flex-col md:gap-1 md:w-full md:px-4">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-blue-dark text-white"
                      : "text-gray-500 hover:bg-gray-200"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative" ref={menuUserRef}>
          <UserMenu
            onClick={() => setUserMenuOpen((v) => !v)}
            userName={currentUser.name}
            userEmail={currentUser.email}
            userAvatar={currentUser.avatarUrl}
          />

          {isUserMenuOpen && (
            <div className="absolute -left-42 top-12 md:left-54  md:-top-12 z-50">
              <DropdownCard title="opções" items={userItems} />
            </div>
          )}
        </div>
      </div>

      {isProfileOpen && (
        <ProfileModal
          role={role}
          user={currentUser}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <main className="bg-gray-600 rounded-t-[20px] md:rounded-tr-none flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
