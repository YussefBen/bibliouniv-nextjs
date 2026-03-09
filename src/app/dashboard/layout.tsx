import { logout } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Action de déconnexion côté serveur
  async function handleLogout() {
    'use server';
    await logout();
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
  <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-600">BiblioUniv</h1>
          <a href="/dashboard" className="text-gray-600 hover:text-blue-600">Mon Profil</a>
          <a href="/dashboard/books" className="text-gray-600 hover:text-blue-600">Catalogue</a>
        </div>
        <form action={handleLogout}>
          <button type="submit" className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
            Se déconnecter
          </button>
        </form>
      </nav>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}