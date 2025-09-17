/**
 * AI Verification Monitoring Page
 * 
 * Page wrapper for the AI Verification Dashboard
 */

import { AIVerificationDashboard } from '@/components/monitoring/AIVerificationDashboard';

export function MonitoringPage() {
  return (
    <div className="min-h-screen bg-background">
      <AIVerificationDashboard />
    </div>
  );
}