// src/types/client.ts

export interface ClientUser {
  id: number;
  numero_compte: string;
  nom: string;
  post_nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  solde: string;
  devise: string;
  type_compte: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  client: ClientUser;
}

export interface Transaction {
  reference: string;
  type_transaction: string;
  montant: string;
  description: string;
  ancien_solde: string;
  nouveau_solde: string;
  created_at: string;
}

export interface AuthContextType {
  client: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (numeroCompte: string, password: string) => Promise<void>;
  setPassword: (numeroCompte: string, password: string) => Promise<void>;
  logout: () => void;
}