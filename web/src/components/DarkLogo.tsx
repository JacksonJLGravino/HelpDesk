import logo from "../assets/Logo_IconDark.svg";

export function DarkLogo({ text = "string" }) {
  return (
    <div className="flex items-center gap-3 md:p-6 md:border-b md:border-gray-200">
      <img src={logo} alt="logo" />
      <div>
        <h2 className="text-gray-600 text-[20px] font-bold">HelpDesk</h2>
        <p className="text-blue-light uppercase text-[10px] font-bold">
          {text}
        </p>
      </div>
    </div>
  );
}
