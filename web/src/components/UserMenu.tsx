import { AvatarImg } from "./AvatarImg";

type Props = React.ComponentProps<"button"> & {
  userName: string;
  userEmail: string;
  userAvatar?: string;
};

export function UserMenu({ userName, userEmail, userAvatar, ...rest }: Props) {
  return (
    <button
      className="flex items-center gap-3 md:p-6 md:border-t md:border-gray-200 cursor-pointer"
      {...rest}
    >
      <AvatarImg name={userName} avatarUrl={userAvatar} />
      <div className="flex flex-col text-left">
        <h4 className="hidden md:block md:text-gray-600 md:text-sm">
          {userName}
        </h4>
        <p className="hidden md:block md:text-gray-400 md:text-[12px]">
          {userEmail}
        </p>
      </div>
    </button>
  );
}
