import { useState, useEffect, useCallback, useRef } from 'react';
import { getInsightStatus } from '../api/csvService';

const POLL_MS = 2500;

/**
 * Normalizes insight-status API payload into { insight_text, recommendation_text, generated_at }.
 */
export function normalizeInsightPayload(data) {
  if (!data) return null;

  if (data.insight) {
    const i = data.insight;
    const insightText =
      i.insight_text ||
      (Array.isArray(data.insights) ? data.insights.join('\n') : '');
    const recommendationText =
      i.recommendation_text ||
      (Array.isArray(data.recommendations) ? data.recommendations.join('\n') : '');
    return {
      insight_text: insightText,
      recommendation_text: recommendationText,
      generated_at: i.generated_at ?? data.generated_at ?? null,
    };
  }

  if (data.insights?.length || data.recommendations?.length) {
    return {
      insight_text: (data.insights || []).join('\n'),
      recommendation_text: (data.recommendations || []).join('\n'),
      generated_at: data.generated_at ?? null,
    };
  }

  return null;
}

/**
 * Poll AI insight status until done/failed — SPA-friendly, no page reload.
 * @param {string|number|null} reportId
 * @param {string} initialStatus - idle | processing | done | failed | none
 */
export function useInsightPolling(reportId, initialStatus = 'idle') {
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState(initialStatus || 'idle');
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollOnce = useCallback(async () => {
    if (!reportId) return null;

    const res = await getInsightStatus(reportId);
    const data = res.data;
    const nextStatus = data.insight_status ?? 'idle';

    setStatus(nextStatus);

    if (nextStatus === 'done') {
      const normalized = normalizeInsightPayload(data);
      if (normalized) {
        setInsight(normalized);
      }
      setError(null);
      stopPolling();
      return data;
    }

    if (nextStatus === 'failed') {
      setError('Generasi AI insight gagal. Silakan coba lagi.');
      stopPolling();
      return data;
    }

    return data;
  }, [reportId, stopPolling]);

  // Sync when parent loads report status (e.g. after fetchReport)
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  // Poll while processing
  useEffect(() => {
    if (!reportId || status !== 'processing') {
      stopPolling();
      return undefined;
    }

    setError(null);
    pollOnce();

    intervalRef.current = setInterval(() => {
      pollOnce().catch((err) => {
        console.error('[useInsightPolling]', err);
        setError(err.message || 'Gagal memeriksa status insight.');
      });
    }, POLL_MS);

    return () => stopPolling();
  }, [reportId, status, pollOnce, stopPolling]);

  const startProcessing = useCallback(() => {
    setError(null);
    setStatus('processing');
  }, []);

  const isPolling = status === 'processing';

  return {
    insight,
    setInsight,
    status,
    setStatus,
    isPolling,
    error,
    setError,
    startProcessing,
    pollOnce,
  };
}
