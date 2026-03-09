import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      borrowings: {
        where: { returnedAt: null }, 
        include: { book: true },
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
      
      {/* Informations de base */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>
        <p><strong>Nom :</strong> {user.firstName || 'Non renseigné'} {user.lastName || ''}</p>
      </div>

      {/* Liste des emprunts en cours */}
      <h3 className="text-xl font-semibold mb-4">Mes emprunts en cours ({user.borrowings.length} / 3)</h3>
      
      {user.borrowings.length === 0 ? (
        <p className="text-gray-500">Vous n'avez aucun emprunt en cours.</p>
      ) : (
        <div className="grid gap-4">
          {user.borrowings.map((borrowing) => (
            <div key={borrowing.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
              <div>
                <h4 className="font-bold">{borrowing.book.title}</h4>
                <p className="text-sm text-gray-600">Emprunté le : {new Date(borrowing.borrowedAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Retour prévu le : {new Date(borrowing.dueDate).toLocaleDateString()}</p>
              </div>
<form action={async () => {
  "use server";
  const { returnBook } = await import("@/actions/borrowingActions");
  await returnBook(borrowing.id, borrowing.bookId);
}}>
  <button 
    type="submit"
    className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
  >
    Rendre le livre
  </button>
</form>              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">En cours</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}