import { useState } from 'react'
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  X,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Terminal,
} from 'lucide-react'
import {
  configStatus,
  testSupabaseConnection,
  type ConnectionTestResult,
} from '../../lib/supabaseClient'
import { Button } from '../ui/Button'

export function ConfigNotice() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)

  const handleCopyEnv = () => {
    const envSnippet = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`
    navigator.clipboard.writeText(envSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const result = await testSupabaseConnection()
    setTestResult(result)
    setIsTesting(false)
  }

  if (isDismissed && !isModalOpen) {
    return null
  }

  return (
    <>
      {/* Top Diagnostics Ribbon */}
      <div className="config-ribbon" role="region" aria-label="Database Configuration Status">
        <div className="config-ribbon-left">
          <span
            className={`beacon-dot ${
              configStatus.isConfigured ? 'beacon-emerald' : 'beacon-amber'
            }`}
            aria-hidden="true"
          />
          <div>
            <strong>
              {configStatus.isConfigured
                ? 'Supabase Database Linked'
                : 'Supabase Project Unlinked'}
              :
            </strong>{' '}
            <span style={{ color: '#cbd5e1' }}>
              {configStatus.isConfigured
                ? `Active client connected to ${configStatus.urlValue}`
                : 'Running in Local Interactive Demo Mode. Connect your Supabase project for real persistence.'}
            </span>
          </div>
        </div>

        <div className="config-ribbon-actions">
          <button
            type="button"
            className="config-assistant-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Database size={13} />
            <span>{configStatus.isConfigured ? 'View Connection' : 'Connect Supabase'}</span>
          </button>
          {!configStatus.isConfigured && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Dismiss banner"
              aria-label="Dismiss configuration banner"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Setup Assistant Modal */}
      {isModalOpen && (
        <div
          className="config-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
        >
          <div className="config-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="config-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Database size={18} color="#60a5fa" />
                </div>
                <div>
                  <h3 id="assistant-title" style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
                    Supabase Connection Assistant
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Configure database persistence for BrightPath CRM
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                aria-label="Close setup modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="config-modal-body">
              {/* Status Header Pill */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: configStatus.isConfigured ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${configStatus.isConfigured ? '#a7f3d0' : '#fde68a'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.85rem',
                }}
              >
                {configStatus.isConfigured ? (
                  <CheckCircle2 size={18} color="#047857" />
                ) : (
                  <AlertTriangle size={18} color="#b45309" />
                )}
                <div>
                  <strong style={{ color: configStatus.isConfigured ? '#047857' : '#92400e' }}>
                    {configStatus.statusMessage}
                  </strong>
                </div>
              </div>

              {/* Step 1 */}
              <div className="config-step-card">
                <div className="config-step-header">
                  <span className="step-number">1</span>
                  <span className="step-title">Create or Open Supabase Project</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                  Log in to your Supabase dashboard and create a project in your preferred region.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Step 2 */}
              <div className="config-step-card">
                <div className="config-step-header">
                  <span className="step-number">2</span>
                  <span className="step-title">Configure Local .env Variables</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                  Copy your Project URL and anon public key from <em>Project Settings &gt; API</em> into your root <code>.env</code> file:
                </p>

                <div className="code-snippet-box">
                  <button
                    type="button"
                    className="code-copy-btn"
                    onClick={handleCopyEnv}
                    title="Copy environment template"
                  >
                    {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy Template'}</span>
                  </button>
                  <pre style={{ margin: 0 }}>
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-client-key`}
                  </pre>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  ⚠️ Never commit the <code>service_role</code> secret key to frontend code.
                </span>
              </div>

              {/* Step 3 */}
              <div className="config-step-card">
                <div className="config-step-header">
                  <span className="step-number">3</span>
                  <span className="step-title">Apply Database Migrations (Phase 3)</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                  Once keys are configured, apply the SQL schema in <code>supabase/migrations/</code> via the Supabase SQL Editor.
                </p>
              </div>

              {/* Live Connection Probe Tool */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Activity size={16} color="var(--primary-600)" />
                    <span>Real-Time Connection Probe</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleTestConnection}
                    isLoading={isTesting}
                  >
                    Ping Supabase
                  </Button>
                </div>

                {testResult && (
                  <div
                    className={`probe-result-box ${
                      testResult.ok ? 'probe-success' : 'probe-error'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {testResult.message}
                        {testResult.latencyMs !== undefined ? ` (${testResult.latencyMs}ms)` : ''}
                      </div>
                      {testResult.details && (
                        <div style={{ fontSize: '0.775rem', opacity: 0.9 }}>
                          {testResult.details}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'var(--bg-app)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Explore in Demo Mode
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false)
                  setIsDismissed(false)
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
