// src/app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ArrowRightLeft,
  Search, Filter, Clock 
} from 'lucide-react';
import api from '@/lib/api';
import { Transaction } from '@/types/client';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUS');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/');
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(trx => {
    if (filter === 'DEPOT' && trx.type_transaction !== 'DEPOT') return false;
    if (filter === 'RETRAIT' && trx.type_transaction !== 'RETRAIT') return false;
    if (filter === 'TRANSFERT' && trx.type_transaction !== 'TRANSFERT') return false;
    if (search && !trx.reference?.toLowerCase().includes(search.toLowerCase())
        && !trx.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTransactionIcon = (type: string, montant: string) => {
    if (type === 'DEPOT') return <TrendingDown className="h-5 w-5 text-green-600" />;
    if (type === 'RETRAIT') return <TrendingUp className="h-5 w-5 text-red-600" />;
    // Transfert
    if (Number(montant) > 0) return <TrendingDown className="h-5 w-5 text-blue-600" />;
    return <TrendingUp className="h-5 w-5 text-orange-600" />;
  };

  const getTransactionColor = (type: string, montant: string) => {
    if (type === 'DEPOT') return 'bg-green-100';
    if (type === 'RETRAIT') return 'bg-red-100';
    if (Number(montant) > 0) return 'bg-blue-100';
    return 'bg-orange-100';
  };

  const getAmountColor = (type: string, montant: string) => {
    if (type === 'DEPOT') return 'text-green-600';
    if (type === 'RETRAIT') return 'text-red-600';
    if (Number(montant) > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getAmountPrefix = (type: string, montant: string) => {
    if (type === 'DEPOT') return '+';
    if (type === 'RETRAIT') return '-';
    if (Number(montant) > 0) return '+';
    return '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <p className="text-gray-500">Toutes vos transactions</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['TOUS', 'DEPOT', 'RETRAIT', 'TRANSFERT'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {f === 'TOUS' && 'Tout'}
            {f === 'DEPOT' && 'Dépôts'}
            {f === 'RETRAIT' && 'Retraits'}
            {f === 'TRANSFERT' && 'Transferts'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
          <p className="text-gray-500">Vous n'avez pas encore de transactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((trx, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTransactionColor(trx.type_transaction, trx.montant)}`}>
                    {getTransactionIcon(trx.type_transaction, trx.montant)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {trx.type_transaction === 'DEPOT' && 'Dépôt'}
                      {trx.type_transaction === 'RETRAIT' && 'Retrait'}
                      {trx.type_transaction === 'TRANSFERT' && 'Transfert'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {trx.description || trx.reference}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(trx.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-lg ${getAmountColor(trx.type_transaction, trx.montant)}`}>
                    {getAmountPrefix(trx.type_transaction, trx.montant)}
                    {Number(trx.montant).toLocaleString()} USD
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Solde: {Number(trx.nouveau_solde).toLocaleString()} USD
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}