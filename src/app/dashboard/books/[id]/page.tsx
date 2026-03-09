import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { borrowBook } from '@/actions/books';

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });

  if (!book) notFound();

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2 text-black">{book.title}</h1>
      <p className="text-xl text-gray-600 mb-6">Par {book.author}</p>
      
      <div className="space-y-4 border-t pt-4 text-black">
        <p><strong>ISBN :</strong> {book.isbn}</p>
        <p><strong>Année :</strong> {book.year || 'Non précisée'}</p>
        <p><strong>Catégorie :</strong> {book.category || 'Général'}</p>
        <p><strong>Statut :</strong> 
          <span className={book.available ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
            {book.available ? 'Disponible immédiatement' : 'Déjà emprunté'}
          </span>
        </p>
      </div>

      {book.available && (
        <form action={async () => {
          'use server'
          await borrowBook(book.id);
        }}>
          <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
            Emprunter ce livre (14 jours)
          </button>
        </form>
      )}
    </div>
  );
}