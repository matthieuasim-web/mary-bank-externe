// src/lib/auth.ts
import api from './api';

export const clientAuth = {
  async login(numeroCompte: string, password: string) {
    const response = await api.post('/login/', { numero_compte: numeroCompte, password });
    const { access, refresh, client } = response.data.data;
    
    localStorage.setItem('client_token', access);
    localStorage.setItem('client_refresh', refresh);
    localStorage.setItem('client_user', JSON.stringify(client));
    
    return { access, refresh, client };
  },

  async setPassword(numeroCompte: string, password: string) {
    await api.post('/set-password/', {
      numero_compte: numeroCompte,
      password,
      confirm_password: password,
    });
  },

  logout() {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_refresh');
    localStorage.removeItem('client_user');
    window.location.href = '/login';
  },

  getClient() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('client_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('client_token');
    }
    return null;
  },
};