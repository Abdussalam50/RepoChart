import { useState, useEffect } from 'react';
import { useClientStore } from '../store/clientStore';
import { useReportStore } from '../store/reportStore';
import { getStatus } from '../api/subscriptionService';
import { useAuthStore } from '../store/authStore';

export function useDashboardData() {
  const { clients, fetchClients } = useClientStore();
  const { reports, fetchReports } = useReportStore();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchClients(), fetchReports()]);
        const subRes = await getStatus();
        setSubscription(subRes.data);
      } catch (e) {
        console.error('Dashboard data error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived stats
  const now = new Date();
  const thisMonth = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // Subscription helpers
  const plan = subscription?.plan ?? user?.plan ?? 'free';
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
    : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

  return {
    loading,
    clients,
    reports,
    recentReports,
    recentClients,
    thisMonthCount: thisMonth.length,
    subscription,
    plan,
    expiresAt,
    daysLeft,
    isExpiringSoon,
  };
}
