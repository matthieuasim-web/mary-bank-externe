// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ClientUser, AuthContextType } from '@/types/client';
import { clientAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedClient = clientAuth.getClient();
    const savedToken = clientAuth.getToken();
    if (savedClient && savedToken) {
      setClient(savedClient);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (numeroCompte: string, password: string) => {
    try {
      const response = await clientAuth.login(numeroCompte, password);
      setClient(response.client);
      setToken(response.access);
      toast.success(`Bienvenue ${response.client.prenom} !`);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.errors?.numero_compte?.[0] 
        || error.response?.data?.errors?.password?.[0]
        || error.response?.data?.message
        || 'Erreur de connexion';
      toast.error(message);
      throw error;
    }
  };

  const setPassword = async (numeroCompte: string, password: string) => {
    try {
      await clientAuth.setPassword(numeroCompte, password);
      toast.success('Mot de passe défini avec succès !');
      router.push('/login');
    } catch (error: any) {
      const message = error.response?.data?.errors?.numero_compte?.[0]
        || error.response?.data?.message
        || 'Erreur';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    clientAuth.logout();
    setClient(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ client, token, isAuthenticated: !!client, isLoading, login, setPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useClientAuth doit être dans AuthProvider');
  return context;
}