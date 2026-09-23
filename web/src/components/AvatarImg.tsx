type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-10 w-10 md:h-8 md:w-8 text-sm",
  lg: "h-12 w-12 text-base",
};

type Props = {
  name: string;
  avatarUrl?: string;
  size?: AvatarSize;
  className?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarImg({ name, avatarUrl, size = "md", className }: Props) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-dark font-semibold text-white ${
        className ?? SIZE_CLASSES[size]
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
