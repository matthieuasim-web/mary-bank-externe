// src/app/(dashboard)/profile/page.tsx
'use client';

import { useClientAuth } from '@/context/AuthContext';
import { 
  User, Mail, Phone, CreditCard, 
  Wallet, Calendar, Shield, LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const { client, logout } = useClientAuth();

  if (!client) return null;

  const infos = [
    { icon: User, label: 'Nom complet', value: client.nom_complet },
    { icon: Mail, label: 'Email', value: client.email },
    { icon: Phone, label: 'Téléphone', value: client.telephone },
    { icon: CreditCard, label: 'Numéro de compte', value: client.numero_compte, mono: true },
    { icon: Wallet, label: 'Type de compte', value: client.type_compte },
    { icon: Wallet, label: 'Devise', value: client.devise },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-500">Informations personnelles</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl shadow p-6 text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-white">
            {client.prenom?.[0]}{client.nom?.[0]}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{client.nom_complet}</h2>
        <p className="text-gray-500">Client depuis le début</p>
      </div>

      {/* Solde */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm mb-1">Solde disponible</p>
        <p className="text-4xl font-bold">{Number(client.solde).toLocaleString()} USD</p>
      </div>

      {/* Infos */}
      <div className="bg-white rounded-2xl shadow divide-y">
        {infos.map((info, index) => {
          const Icon = info.icon;
          return (
            <div key={index} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{info.label}</p>
                <p className={`font-medium text-gray-900 ${info.mono ? 'font-mono' : ''}`}>
                  {info.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Déconnexion */}
      <button
        onClick={logout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 flex items-center justify-center gap-2"
      >
        <LogOut className="h-5 w-5" />
        Se déconnecter
      </button>
    </div>
  );
}