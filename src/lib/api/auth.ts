
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

export type UsuarioAutenticado = {
  id: number;
  nombre: string;
  username: string;
  rol: string;
};

export type RespuestaLogin = {
  accessToken: string;
  tokenType: string;
  usuario: UsuarioAutenticado;
};

export async function iniciarSesion(
  username: string,
  password: string
): Promise<RespuestaLogin> {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    throw new Error("No se pudo iniciar sesión. Intente nuevamente.");
  }

  return (await respuesta.json()) as RespuestaLogin;
}
