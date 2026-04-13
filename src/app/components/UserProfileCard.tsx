import { useEffect, useState } from 'react';

/** Respuesta JSON de GET /api/profile (mismo contrato que server/index.ts). */
interface ProfileUser {
  id: number;
  name: string | null;
  email: string;
}

/**
 * Tarjeta de “usuario logueado” en la esquina superior.
 * Petición relativa `/api/profile`: en desarrollo Vite (vite.config.ts) hace proxy al API en :3001.
 */
export default function UserProfileCard() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/profile');
        const body = (await res.json()) as ProfileUser | { error?: string };

        if (cancelled) return;

        if (!res.ok) {
          const message =
            'error' in body && typeof body.error === 'string'
              ? body.error
              : 'No se pudo cargar el perfil';
          setError(message);
          setUser(null);
          return;
        }

        setUser(body as ProfileUser);
      } catch {
        if (!cancelled) {
          setError('Sin conexión con el servidor (¿npm run dev:api?)');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs text-left">
      {loading && <p className="text-sm text-gray-500">Cargando perfil…</p>}

      {!loading && error && <p className="text-sm text-gray-500">{error}</p>}

      {!loading && !error && user && (
        <>
          {/* Nombre: mismo peso visual que títulos secundarios de la app */}
          <p className="font-semibold text-gray-800 truncate" title={user.name ?? undefined}>
            {user.name ?? 'Sin nombre'}
          </p>
          <p className="text-sm text-gray-600 truncate mt-0.5" title={user.email}>
            {user.email}
          </p>
        </>
      )}
    </div>
  );
}
