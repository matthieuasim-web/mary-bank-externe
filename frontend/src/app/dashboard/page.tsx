// src/app/(dashboard)/page.tsx
'use client';

import { useClientAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react'; 
import { 
  Wallet, TrendingUp, TrendingDown, ArrowRightLeft,
  Clock, Eye
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link'; 

export default function DashboardPage() {
  const { client } = useClientAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Erreur chargement transactions');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {client?.prenom} 👋
        </h1>
        <p className="text-gray-500">{client?.numero_compte}</p>
      </div>

      {/* Solde */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-5 w-5" />
          <span className="text-blue-200">Solde disponible</span>
        </div>
        <p className="text-4xl font-bold">{Number(client?.solde || 0).toLocaleString()} USD</p>
        <p className="text-blue-200 mt-1">Compte {client?.type_compte}</p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/transfert"
          className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Transfert</p>
            <p className="text-sm text-gray-500">Envoyer de l'argent</p>
          </div>
        </Link>

        <Link
          href="/dashboard/transactions"
          className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Historique</p>
            <p className="text-sm text-gray-500">Mes transactions</p>
          </div>
        </Link>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Transactions récentes</h2>
          <Link href="/dashboard/transactions" className="text-blue-600 text-sm hover:underline">
            Voir tout
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune transaction</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((trx: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    trx.type_transaction === 'TRANSFERT' && trx.montant > 0 
                      ? 'bg-green-100' 
                      : trx.type_transaction === 'DEPOT'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {trx.type_transaction === 'DEPOT' || (trx.type_transaction === 'TRANSFERT' && trx.montant > 0) ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{trx.description || trx.type_transaction}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(trx.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  trx.type_transaction === 'DEPOT' || (trx.type_transaction === 'TRANSFERT' && trx.montant > 0)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {trx.type_transaction === 'DEPOT' || (trx.type_transaction === 'TRANSFERT' && trx.montant > 0) ? '+' : '-'}
                  {Number(trx.montant).toLocaleString()} USD
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}