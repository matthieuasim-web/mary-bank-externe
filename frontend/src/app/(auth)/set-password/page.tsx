// src/app/(auth)/set-password/page.tsx
'use client';

import { useState } from 'react';
import { useClientAuth } from '@/context/AuthContext';
import { Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SetPasswordPage() {
  const [numeroCompte, setNumeroCompte] = useState('');
  const [password, setPasswordLocal] = useState('');  // Renommé ici
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPassword } = useClientAuth();  // Celui du contexte

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await setPassword(numeroCompte, password);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-16 w-16 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Définir mon mot de passe</h1>
            <p className="text-gray-600 mt-2">Première connexion à votre compte</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="12 chiffres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPasswordLocal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Répéter le mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Définition...' : 'Définir le mot de passe'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}