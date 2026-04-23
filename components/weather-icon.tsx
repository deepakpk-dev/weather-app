import Image from "next/image";
import { cn } from "@/lib/utils";
import { getIconName, getLabel } from "@/lib/wmo-codes";

type WeatherIconProps = {
  code: number;
  isDay: boolean;
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function WeatherIcon({
  code,
  isDay,
  size = 96,
  className,
  alt,
  priority = false,
}: WeatherIconProps) {
  const iconName = getIconName(code, isDay);
  const label = alt ?? getLabel(code);

  return (
    <Image
      src={`/meteocons/${iconName}.svg`}
      alt={label}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={cn("select-none drop-shadow-xl", className)}
    />
  );
}
