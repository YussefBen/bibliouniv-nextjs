import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export default async function Home() {
  // On vérifie si l'utilisateur est déjà connecté
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const isConnected = token ? await verifyAccessToken(token) : null;

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation simple */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-blue-600">
          BiblioUniv
        </div>
        <div className="space-x-4">
          {isConnected ? (
            <Link href="/dashboard" className="font-medium hover:text-blue-600 transition">
              Mon Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-medium hover:text-blue-600 transition">
                Connexion
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
          Système de Gestion Moderne • 2025/2026
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl">
          La culture universitaire, <br />
          <span className="text-blue-600">accessible en un clic.</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
          Gérez vos emprunts, consultez la disponibilité des ouvrages en temps réel et recevez des alertes pour vos retours. Une plateforme pensée pour les étudiants et enseignants de l'université.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {isConnected ? (
            <Link 
              href="/dashboard/books" 
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              Accéder au Catalogue
            </Link>
          ) : (
            <>
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Commencer maintenant
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Section Features Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left border-t border-gray-100 pt-16 w-full">
          <div>
            <h3 className="font-bold text-lg mb-2">📚 Catalogue en temps réel</h3>
            <p className="text-gray-500 text-sm">Consultez des milliers d'ouvrages et vérifiez leur disponibilité instantanément.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">⏱️ Emprunts Simplifiés</h3>
            <p className="text-gray-500 text-sm">Empruntez jusqu'à 3 livres simultanément pour une durée de 14 jours renouvelable.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">🔒 Accès Sécurisé</h3>
            <p className="text-gray-500 text-sm">Une protection des données par double token JWT et stockage sécurisé HTTP-Only.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-10 text-center text-gray-400 text-sm">
        © 2026 BiblioUniv - Projet Final Master 2 - Développement Fullstack
      </footer>
    </div>
  );
}