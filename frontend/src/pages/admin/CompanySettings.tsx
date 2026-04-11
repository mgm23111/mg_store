import { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';
import { storeSettingsService } from '../../api/storeSettingsService';

export const AdminCompanySettings = () => {
  const { addToast } = useUIStore();
  const { settings, fetchSettings, setSettings } = useStoreSettingsStore();
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setCompanyName(settings.companyName || '');
    setLogoUrl(settings.logoUrl || '');
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      addToast('error', 'El nombre de la empresa es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const updated = await storeSettingsService.updateSettings({
        companyName: companyName.trim(),
        logoUrl: logoUrl.trim() || null,
      });
      setSettings(updated);
      addToast('success', 'Configuración de empresa actualizada');
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      addToast('error', 'Selecciona un archivo de imagen');
      return;
    }

    try {
      setUploading(true);
      const updated = await storeSettingsService.uploadLogo(logoFile);
      setSettings(updated);
      setLogoUrl(updated.logoUrl || '');
      setLogoFile(null);
      addToast('success', 'Logo subido correctamente');
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'No se pudo subir el logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Configuración de Empresa</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Nombre de la empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="MG Store"
            required
          />

          <Input
            label="URL del logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://dominio.com/logo.png"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Subir logo desde archivo</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <Button
                type="button"
                onClick={handleUploadLogo}
                isLoading={uploading}
                disabled={!logoFile}
              >
                Subir logo
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Al subir archivo, se actualizará automáticamente la URL del logo.
            </p>
          </div>

          {(logoUrl || settings.logoUrl) && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Vista previa</p>
              <img
                src={logoUrl || settings.logoUrl || ''}
                alt="Logo de la empresa"
                className="h-16 w-auto object-contain border rounded bg-gray-50 p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="pt-3">
            <Button type="submit" isLoading={saving}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
