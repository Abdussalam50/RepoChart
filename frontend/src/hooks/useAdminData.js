import { useState, useEffect, useCallback } from 'react';
import adminService from '../api/adminService';

export function useAdminData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, growthRes, retentionRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getGrowth('6m'),
        adminService.getRetention(),
      ]);

      setData({
        overview: overviewRes.data,
        growth: growthRes.data,
        retention: retentionRes.data,
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchData, 30000);

    // Cleanup saat unmount
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, lastRefresh, refetch: fetchData };
}
