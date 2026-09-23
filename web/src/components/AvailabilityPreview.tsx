type Props = {
  times: string[];
  max?: number;
  mobileMax?: number;
};

export function AvailabilityPreview({ times, max = 4, mobileMax = 1 }: Props) {
  const sortedTimes = [...times].sort();

  function renderPills(limit: number) {
    const visible = sortedTimes.slice(0, limit);
    const remaining = sortedTimes.length - visible.length;

    return (
      <>
        {visible.map((time) => (
          <span
            key={time}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
          >
            {time}
          </span>
        ))}

        {remaining > 0 && (
          <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-400">
            +{remaining}
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 md:hidden">
        {renderPills(mobileMax)}
      </div>
      <div className="hidden flex-wrap gap-2 md:flex">{renderPills(max)}</div>
    </>
  );
}
