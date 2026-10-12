import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "danger";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-900 text-white hover:bg-blue-800 focus-visible:ring-blue-500",
  danger:
    "bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant],
        className
      )}
      {...rest}
    />
  );
}
