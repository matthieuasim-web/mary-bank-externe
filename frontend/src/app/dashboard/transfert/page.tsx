// src/app/(dashboard)/transfert/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, ArrowRight, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TransfertPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    compte_dest: '',
    montant: '',
    description: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.compte_dest || !formData.montant) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transfert/', {
        compte_dest: formData.compte_dest,
        montant: parseFloat(formData.montant),
        description: formData.description,
      });

      setSuccess(true);
      setResult(response.data.data);
      toast.success('Transfert effectué !');
      
      setFormData({ compte_dest: '', montant: '', description: '' });
      
    } catch (error: any) {
      const message = error.response?.data?.errors?.compte_dest?.[0]
        || error.response?.data?.errors?.montant?.[0]
        || error.response?.data?.message
        || 'Erreur lors du transfert';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfert réussi !</h2>
          <p className="text-gray-500 mb-6">Le transfert a été effectué avec succès</p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-bold text-blue-600">{result.montant} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destinataire</span>
              <span className="font-medium">{result.beneficiaire}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compte</span>
              <span className="font-mono">{result.compte_dest}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nouveau solde</span>
                <span className="font-bold text-green-600">{result.nouveau_solde} USD</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
          >
            Nouveau transfert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transfert</h1>
        <p className="text-gray-500">Envoyer de l'argent vers un autre compte</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Compte destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compte destinataire
            </label>
            <input
              type="text"
              required
              maxLength={12}
              value={formData.compte_dest}
              onChange={(e) => updateField('compte_dest', e.target.value.replace(/\D/g, ''))}
              placeholder="Numéro de compte à 12 chiffres"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={formData.montant}
                onChange={(e) => updateField('montant', e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Motif du transfert"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              'Transfert en cours...'
            ) : (
              <>
                <ArrowRightLeft className="h-5 w-5" />
                Effectuer le transfert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}