"use client";

import { Input } from "@/components/ui/Input";

type FormFieldProps = {
  label: string;
  id: string;
  type?: "text" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string | null;
  maxLength?: number;
  inputMode?: "text" | "numeric";
  autoComplete?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  maxLength,
  inputMode,
  autoComplete,
  ref,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <Input
        ref={ref}
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled}
        invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
