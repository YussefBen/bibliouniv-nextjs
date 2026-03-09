'use server'

import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation de l'ID avec Zod pour la sécurité
const idSchema = z.string().uuid();

/**
 * ACTION : Emprunter un livre
 * Respecte les règles métier : max 3 livres, dispo check, date +14j
 */
export async function borrowBook(bookId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) return { error: "Vous devez être connecté." };
    
    const payload = await verifyAccessToken(token);
    if (!payload) return { error: "Session expirée." };
    
    const userId = payload.userId;

    const validatedId = idSchema.parse(bookId);

    const activeBorrowingsCount = await prisma.borrowing.count({
      where: {
        userId: userId,
        returnedAt: null 
      }
    });

    if (activeBorrowingsCount >= 3) {
      return { error: "Limite atteinte : vous avez déjà 3 livres en cours d'emprunt." };
    }

    const book = await prisma.book.findUnique({ where: { id: validatedId } });
    
    if (!book) return { error: "Livre introuvable." };
    if (!book.available) return { error: "Ce livre est déjà emprunté." };

    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          userId: userId,
          bookId: validatedId,
          dueDate: dueDate,
        },
      }),
      prisma.book.update({
        where: { id: validatedId },
        data: { available: false },
      }),
    ]);

    revalidatePath('/dashboard/books');
    revalidatePath(`/dashboard/books/${validatedId}`);
    revalidatePath('/dashboard/profile');
    
    return { success: true };

  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Format d'ID invalide." };
    console.error("Erreur Emprunt:", error);
    return { error: "Une erreur est survenue lors de l'emprunt." };
  }
}

/**
 * ACTION : Rendre un livre
 * Marque comme rendu et libère le livre pour les autres
 */
export async function returnBook(borrowingId: string) {
  try {
    const validatedId = idSchema.parse(borrowingId);

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: validatedId },
      select: { id: true, bookId: true, returnedAt: true }
    });

    if (!borrowing || borrowing.returnedAt) {
      return { error: "Cet emprunt est déjà clôturé ou inexistant." };
    }

    await prisma.$transaction([
      prisma.borrowing.update({
        where: { id: validatedId },
        data: { returnedAt: new Date() }
      }),
      prisma.book.update({
        where: { id: borrowing.bookId },
        data: { available: true }
      })
    ]);

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/books');
    
    return { success: true };
  } catch (error) {
    console.error("Erreur Retour:", error);
    return { error: "Impossible de rendre le livre." };
  }
}