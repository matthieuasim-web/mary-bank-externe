// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useClientAuth } from '@/context/AuthContext';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [numeroCompte, setNumeroCompte] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(numeroCompte, password);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Building2 className="mx-auto h-16 w-16 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Ma Banque</h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre espace client</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de compte
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={numeroCompte}
                onChange={(e) => setNumeroCompte(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12 chiffres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe 
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Première connexion ?{' '}
              <Link href="/set-password" className="text-blue-600 hover:underline font-medium">
                Définir mon mot de passe
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}