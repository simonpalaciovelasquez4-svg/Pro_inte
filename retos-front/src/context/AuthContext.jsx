import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(!!localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUsuario(null);
  }, []);

  // Al abrir la app, si hay token se valida con /auth/me.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    authApi.me()
      .then(setUsuario)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCargando(false));
  }, []);

  // Si el backend responde 401 (token vencido), se cierra la sesión.
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const guardarSesion = ({ user, token }) => {
    localStorage.setItem('token', token);
    setUsuario(user);
  };

  const login = async (credenciales) => guardarSesion(await authApi.login(credenciales));
  const registrar = async (datos) => guardarSesion(await authApi.register(datos));

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
