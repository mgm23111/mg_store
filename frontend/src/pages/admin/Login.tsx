import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { authService } from '../../api/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const { settings, fetchSettings } = useStoreSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);
      addToast('success', 'Inicio de sesión exitoso');
      navigate('/admin/dashboard');
    } catch (error) {
      addToast('error', 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt={settings.companyName}
            className="h-14 w-auto object-contain mx-auto mb-3"
          />
        ) : null}
        <h1 className="text-3xl font-bold text-center mb-2">{settings.companyName}</h1>
        <p className="text-gray-600 text-center mb-8">Panel de Administración</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@mgstore.com"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};
