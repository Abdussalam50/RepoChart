import { useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useClientStore } from '../../store/clientStore';
import { ClientCard } from '../../components/client/ClientCard';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Plus, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useModalStore } from '../../store/modalStore';

export function ClientList() {
  const { clients, fetchClients, isLoading } = useClientStore();
  const { isFree, canAddClient } = usePlanLimits();
  const { openModal } = useModalStore();

  useEffect(() => {
    fetchClients();
  }, []);

  const canCreate = canAddClient(clients.length);

  return (
    <PageWrapper 
      title="Clients" 
      subtitle="Manage your client profiles and brands"
      actions={
        !canCreate ? (
          <Button 
            onClick={openModal}
            className="bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200"
            title="Batas paket Free tercapai. Klik untuk upgrade ke Pro."
          >
            <Plus className="mr-2 h-4 w-4 text-slate-400" />
            Add Client (Limit)
          </Button>
        ) : (
          <Link to="/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        )
      }
    >
      {isFree && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/30 text-slate-700 shadow-sm font-sans">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-violet-900 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Paket Free Aktif
            </h4>
            <p className="text-xs text-slate-500">
              Anda menggunakan <strong>{clients.length} dari 1</strong> limit klien aktif. Upgrade ke Pro untuk klien tak terbatas dan fitur premium.
            </p>
          </div>
          <button 
            onClick={openModal}
            className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer hover:bg-violet-700"
          >
            Upgrade ke Pro
          </button>
        </div>
      )}
      {isLoading ? (
        <Loader />
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">No clients yet</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating a new client profile.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
