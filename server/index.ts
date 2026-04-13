/**
 * API HTTP mínima para HabitHero.
 * Corre en Node (no en el navegador) para poder usar Prisma y PostgreSQL.
 * El frontend en Vite (:5173) llama a rutas /api/*; en desarrollo Vite hace proxy aquí.
 */

// Carga .env de la raíz del repo (DATABASE_URL, API_PORT opcional).
import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Una sola instancia evita agotar conexiones a la BD en recargas con tsx watch.
const prisma = new PrismaClient();

const app = express();

// Permite peticiones directas desde el origen del frontend (útil sin proxy o en prod separada).
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: false,
  }),
);

/**
 * Perfil “simulado”: siempre el usuario con id=1.
 * El cliente React usa fetch('/api/profile') y Vite reenvía a este servidor.
 */
app.get('/api/profile', async (_req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario con id 1 no encontrado' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('[api/profile]', err);
    return res.status(500).json({ error: 'Error al leer el usuario' });
  }
});

const port = Number(process.env.API_PORT) || 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port} (GET /api/profile)`);
});
