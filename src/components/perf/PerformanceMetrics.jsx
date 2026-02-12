import React from 'react';
import { base44 } from '@/api/base44Client';

export default function PerformanceMetrics({ pageName = 'unknown', fetchTimeMs = 0 }) {
  React.useEffect(() => {
    let lcp = 0;
    let cls = 0;
    let fid = 0;

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcp = Math.round((last.renderTime || last.loadTime || last.startTime) || 0);
    });
    try { lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const e = entry;
        if (!e.hadRecentInput) cls += e.value || 0;
      }
    });
    try { clsObserver.observe({ type: 'layout-shift', buffered: true }); } catch {}

    // First Input Delay (approx)
    const fidObserver = new PerformanceObserver((entryList) => {
      const first = entryList.getEntries()[0];
      if (first) fid = Math.round((first.processingStart || 0) - (first.startTime || 0));
    });
    try { fidObserver.observe({ type: 'first-input', buffered: true }); } catch {}

    const timeout = setTimeout(() => {
      base44.analytics.track({
        eventName: 'perf_metrics',
        properties: {
          page: pageName,
          lcp_ms: lcp || 0,
          cls: Number(cls.toFixed(3)) || 0,
          fid_ms: fid || 0,
          fetch_ms: Math.round(fetchTimeMs) || 0,
        }
      });
    }, 8000);

    return () => {
      clearTimeout(timeout);
      try { lcpObserver.disconnect(); } catch {}
      try { clsObserver.disconnect(); } catch {}
      try { fidObserver.disconnect(); } catch {}
    };
  }, [pageName, fetchTimeMs]);

  return null;
}