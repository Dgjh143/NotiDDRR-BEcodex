export function CiudadanosEmptyState({
  message = "Todavía no hay ciudadanos registrados.",
}: {
  message?: string;
}) {
  return (
    <p className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
      {message}
    </p>
  );
}
