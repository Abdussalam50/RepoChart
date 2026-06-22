import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useClientStore } from '../../store/clientStore';
import { Button } from '../../components/ui/Button';
import { Upload } from 'lucide-react';
import { usePlanLimits } from '../../hooks/usePlanLimits';

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { clients, fetchClients, createClient, updateClient, fetchClient, currentClient, isLoading, error, uploadLogo } = useClientStore();
  const { canAddClient } = usePlanLimits();
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    segment: '',
    brand_color: '#8b5cf6'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchClient(id);
    } else {
      fetchClients();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit && clients.length > 0 && !canAddClient(clients.length)) {
      navigate('/clients');
    }
  }, [clients, isEdit, navigate]);

  useEffect(() => {
    if (isEdit && currentClient) {
      setFormData({
        name: currentClient.name,
        whatsapp_number: currentClient.whatsapp_number || '',
        segment: currentClient.segment || '',
        brand_color: currentClient.brand_color || '#8b5cf6'
      });
      if (currentClient.logo_path) {
        // Prepend the Laravel backend host if it's stored relatively
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        setLogoPreview(`${baseUrl}/storage/${currentClient.logo_path}`);
      }
    }
  }, [isEdit, currentClient]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let client;
      if (isEdit) {
        client = await updateClient(id, formData);
      } else {
        client = await createClient(formData);
      }
      
      if (logoFile && client) {
        await uploadLogo(client.id, logoFile);
      }
      
      navigate('/clients');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <PageWrapper 
      title={isEdit ? "Edit Client" : "New Client"} 
      subtitle="Set up brand guidelines and contact for the client"
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Client Name</label>
              <input
                type="text"
                required
                className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">WhatsApp Number</label>
              <input
                type="text"
                placeholder="628123456789"
                className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Segment</label>
            <select
              className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            >
              <option value="">Select Segment</option>
              <option value="Digital marketer">Digital marketer</option>
              <option value="HR & Admin">HR & Admin</option>
              <option value="UMKM">UMKM</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          {/* Logo Upload Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Client Logo</label>
            <div className="mt-2 flex items-center gap-6">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:bg-slate-100">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
                >
                  Choose File
                </label>
                <p className="text-xs text-slate-500">PNG, JPG, SVG up to 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Brand Color (Hex)</label>
            <div className="mt-2 flex gap-3">
              <input
                type="color"
                className="h-12 w-12 cursor-pointer rounded-xl border-0 p-1"
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
              />
              <input
                type="text"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/clients')}
            >
              Cancel
            </Button>
            <Button variant="primary" className="cursor-pointer" type="submit"  isLoading={isLoading}>
              {isEdit ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
