import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { returnBook } from '@/actions/books';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  if (!payload) return <p>Veuillez vous reconnecter.</p>;

  // On récupère l'utilisateur avec TOUS ses emprunts
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      borrowings: {
        include: { book: true },
        orderBy: { borrowedAt: 'desc' }
      }
    }
  });

  if (!user) return <p>Utilisateur non trouvé.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon Profil Étudiant</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-8 border-l-4 border-blue-500 text-black">
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-black">Mes Emprunts (En cours & Historique)</h2>
      
      <div className="space-y-4">
        {user.borrowings.length === 0 && <p className="text-gray-500">Aucun emprunt enregistré.</p>}
        
        {user.borrowings.map((borrow) => {
          const isReturned = !!borrow.returnedAt;
          const isLate = !isReturned && new Date() > new Date(borrow.dueDate);
          
          let statusText = "En cours";
          let statusColor = "text-blue-600 bg-blue-50";

          if (isReturned) {
            statusText = "Rendu";
            statusColor = "text-green-600 bg-green-50";
          } else if (isLate) {
            statusText = "En retard";
            statusColor = "text-red-600 bg-red-50 font-bold animate-pulse";
          }

          return (
            <div key={borrow.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border border-gray-100">
              <div className='text-black'>
                <h3 className="font-bold">{borrow.book.title}</h3>
                <p className="text-sm text-gray-500 italic">{borrow.book.author}</p>
                <div className="mt-2 flex gap-3 items-center">
                  <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
                    {statusText}
                  </span>
                  <span className="text-xs text-gray-400">
                    À rendre le : {new Date(borrow.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!isReturned && (
                <form action={async () => {
                  'use server'
                  await returnBook(borrow.id);
                }}>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black transition">
                    Rendre le livre
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}