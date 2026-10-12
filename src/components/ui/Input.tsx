import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border bg-white p-3 text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        className
      )}
      aria-invalid={invalid ? "true" : undefined}
      {...rest}
    />
  );
}
