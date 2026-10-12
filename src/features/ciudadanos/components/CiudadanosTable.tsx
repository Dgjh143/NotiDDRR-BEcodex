import type { Ciudadano } from "@/features/ciudadanos/types/ciudadano";

export function CiudadanosTable({ ciudadanos }: { ciudadanos: Ciudadano[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-blue-950 text-white">
          <tr>
            <th scope="col" className="p-3">
              Nombre
            </th>
            <th scope="col" className="p-3">
              CI
            </th>
            <th scope="col" className="p-3">
              WhatsApp
            </th>
          </tr>
        </thead>
        <tbody>
          {ciudadanos.map((c) => (
            <tr key={c.id} className="border-b border-gray-200">
              <td className="p-3 text-gray-900">{c.nombre}</td>
              <td className="p-3 text-gray-900">{c.ci}</td>
              <td className="p-3 text-gray-900">{c.whatsapp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
