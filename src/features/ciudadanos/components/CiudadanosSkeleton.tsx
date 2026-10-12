export function CiudadanosSkeleton() {
  return (
    <div>
      <p role="status" className="sr-only">
        Cargando ciudadanos…
      </p>
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
