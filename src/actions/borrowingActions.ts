"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function returnBook(borrowingId: string, bookId: string) {
    try {
        await prisma.borrowing.update({
            where: { id: borrowingId },
            data: { returnedAt: new Date() }
        });

        await prisma.book.update({
            where: { id: bookId },
            data: { available: true }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Erreur lors du retour du livre :", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}