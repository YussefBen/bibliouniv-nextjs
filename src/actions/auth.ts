'use server'

import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// 1. Validation Zod
const authSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Fonction utilitaire pour stocker les cookies de manière sécurisée
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const, // Strictement requis par l'énoncé
    path: '/',
  };

  // Access Token : 15 minutes
  cookieStore.set('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  
  // Refresh Token : 7 jours
  cookieStore.set('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
}

// 2. Action d'Inscription (Signup)
export async function signup(formData: FormData) {
  try {
    // Utilisation de safeParse pour éviter les erreurs TypeScript strictes
    const parsedData = authSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsedData.success) {
      return { error: parsedData.error.issues[0]?.message || "Données invalides" };
    }

    const { email, password } = parsedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const payload = { userId: user.id, role: user.role };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    return { success: true };
  } catch (error) {
    console.error("DÉTAIL ERREUR SIGNUP :", error); 
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}

// 3. Action de Connexion (Login)
export async function login(formData: FormData) {
  try {
    const parsedData = authSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

   if (!parsedData.success) {
      return { error: parsedData.error.issues[0]?.message || "Données invalides" };
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Identifiants incorrects." };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { error: "Identifiants incorrects." };
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    return { success: true };
  } catch (error) {
    console.error("DÉTAIL ERREUR LOGIN :", error);
    return { error: "Une erreur est survenue lors de la connexion." };
  }
}

// 4. Action de Déconnexion
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}