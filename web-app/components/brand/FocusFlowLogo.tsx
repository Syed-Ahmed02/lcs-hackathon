import Image from "next/image";
import { cn } from "@/lib/utils";

type FocusFlowLogoProps = {
  className?: string;
  /** CSS pixel size (width & height); defaults to 32 */
  size?: number;
  /** Visually hidden label for icon-only usage */
  alt?: string;
};

/**
 * Brand mark from `/logo.png` — rounded container, object-contain for non-square artwork.
 */
export function FocusFlowLogo({ className, size = 32, alt = "FocusFlow" }: FocusFlowLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt={alt}
        width={size}
        height={size}
        className="size-full object-contain"
        priority
      />
    </span>
  );
}
