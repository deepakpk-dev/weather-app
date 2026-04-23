import { getGradient } from "@/lib/wmo-codes";

type GradientBackdropProps = {
  weatherCode: number;
  isDay: boolean;
};

export function GradientBackdrop({ weatherCode, isDay }: GradientBackdropProps) {
  const base = getGradient(weatherCode, isDay);
  const overlay = isDay
    ? "radial-gradient(circle at 80% 10%, rgba(255,255,255,0.22), transparent 55%)"
    : "radial-gradient(circle at 80% 10%, rgba(148,163,184,0.18), transparent 60%)";

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 transition-[background] duration-700 ease-out motion-reduce:transition-none"
      style={{ backgroundImage: `${overlay}, ${base}` }}
    />
  );
}
