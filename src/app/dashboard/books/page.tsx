import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

// Interface pour les paramètres de recherche (Next.js 15)
interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; available?: string }>;
}

export default async function BooksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // 1. Extraction et nettoyage des paramètres
  const query = params.q || '';
  const currentPage = Number(params.page) || 1;
  const isAvailableOnly = params.available === 'true';
  const take = 6; // On passe à 6 pour un meilleur rendu en grille (3x2)
  const skip = (currentPage - 1) * take;

  // 2. Construction du filtre Prisma Typé
  const whereClause: Prisma.BookWhereInput = {
    AND: [
      query 
        ? {
            OR: [
              { title: { contains: query } },
              { author: { contains: query } },
              { category: { contains: query } },
            ],
          }
        : {},
      isAvailableOnly ? { available: true } : {},
    ],
  };

  // 3. Exécution des requêtes en parallèle (Performance)
  const [books, totalBooks] = await Promise.all([
    prisma.book.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { title: 'asc' },
      select: { 
        id: true, 
        title: true, 
        author: true, 
        year: true, 
        category: true, 
        available: true,
        isbn: true 
      }
    }),
    prisma.book.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalBooks / take);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Catalogue de la Bibliothèque</h2>
        <p className="text-gray-500 mt-2">Explorez et empruntez parmi nos {totalBooks} ouvrages disponibles.</p>
      </header>

      {/* --- FORMULAIRE DE FILTRES --- */}
      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recherche</label>
          <div className="relative">
            <input 
              type="text" 
              name="q" 
              defaultValue={query} 
              className="w-full border border-gray-300 rounded-lg p-2.5 pl-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              placeholder="Titre, auteur ou catégorie..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <input 
            type="checkbox" 
            name="available" 
            value="true" 
            defaultChecked={isAvailableOnly} 
            id="available"
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="available" className="text-sm font-medium text-gray-700 cursor-pointer">
            Disponibles uniquement
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
            Filtrer
          </button>
          {/* Bouton pour réinitialiser les filtres */}
          <Link href="/dashboard/books" className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Effacer
          </Link>
        </div>
      </form>

      {/* --- GRILLE DES LIVRES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <span className="text-5xl block mb-4">📖</span>
             <p className="text-gray-500 text-lg">Aucun livre ne correspond à vos critères.</p>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                    {book.category || "Général"}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${book.available ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${book.available ? 'bg-green-600' : 'bg-red-500'}`}></span>
                    {book.available ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 mb-4 italic">par {book.author}</p>
                <div className="text-sm text-gray-400">
                  ISBN: {book.isbn} • {book.year}
                </div>
              </div>

              <div className="p-5 pt-0 mt-auto">
                <Link 
                  href={`/dashboard/books/${book.id}`} 
                  className="block w-full text-center py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  Détails & Emprunt
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 py-4">
          <Link 
            href={`?q=${query}&available=${isAvailableOnly}&page=${Math.max(1, currentPage - 1)}`} 
            className={`px-4 py-2 border rounded-lg bg-white font-medium transition-all ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:border-blue-600 hover:text-blue-600'}`}
          >
            ← Précédent
          </Link>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Link
                key={i + 1}
                href={`?q=${query}&available=${isAvailableOnly}&page=${i + 1}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {i + 1}
              </Link>
            ))}
          </div>

          <Link 
            href={`?q=${query}&available=${isAvailableOnly}&page=${Math.min(totalPages, currentPage + 1)}`} 
            className={`px-4 py-2 border rounded-lg bg-white font-medium transition-all ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:border-blue-600 hover:text-blue-600'}`}
          >
            Suivant →
          </Link>
        </div>
      )}
    </div>
  );
}