import { Outlet } from "react-router";
import bgImage from "../assets/Login_Background.png";
import logoSvg from "../assets/Logo_IconLight.svg";

export function AuthLayout() {
  return (
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="min-h-screen w-full flex flex-col lg:flex-row bg-cover bg-center bg-no-repeat"
    >
      <main
        style={{ height: "calc(100vh - 12px)" }}
        className="absolute z-10 w-full top-8 bg-gray-600 rounded-t-3xl md:w-2xl md:right-0 md:top-3 md:rounded-r-none  "
      >
        <div className="flex flex-col items-center justify-center ">
          <div className="flex items-center gap-3 pt-8 mb-6 md:pt-12 md:mb-8">
            <img src={logoSvg} alt="logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-blue-dark">HelpDesk</h1>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
