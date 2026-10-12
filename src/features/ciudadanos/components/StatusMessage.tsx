type StatusTone = "success" | "error" | "info";

const TONE_STYLES: Record<StatusTone, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function StatusMessage({
  tone,
  message,
}: {
  tone: StatusTone;
  message: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-lg border p-3 text-sm ${TONE_STYLES[tone]}`}
    >
      {message}
    </p>
  );
}
