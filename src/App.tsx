import { useState, useEffect } from 'react'
import {
  LogIn,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type { NavTab } from './types/navigation'
import { AppLayout } from './components/layout/AppLayout'
import { Button } from './components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card'
import { ConfigNotice } from './components/feedback/ConfigNotice'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { SignInModal } from './features/auth/SignInModal'
import { DashboardView } from './features/dashboard/DashboardView'
import { LeadListView } from './features/leads/LeadListView'
import { FollowUpListView } from './features/followups/FollowUpListView'
import { ReportsView } from './features/reports/ReportsView'
import { followUpsService } from './services/followUpsService'
import type { UserRole } from './types/auth'

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [openCreateSignal, setOpenCreateSignal] = useState<number>(0)
  const [focusLeadId, setFocusLeadId] = useState<string | null>(null)
  const [focusLeadName, setFocusLeadName] = useState<string | null>(null)
  const [overdueFollowupsCount, setOverdueFollowupsCount] = useState<number>(2)
  const { showToast } = useToast()

  const {
    role: userRole,
    profile,
    user,
    isWorkshopMode,
    switchWorkshopRole,
    openAuthModal,
  } = useAuth()

  useEffect(() => {
    followUpsService.getFollowUps(userRole, user?.id).then((res) => {
      const stats = followUpsService.getFollowUpStats(res.followUps)
      setOverdueFollowupsCount(stats.overdueCount)
    })
  }, [userRole, user?.id, activeTab])

  const handleGlobalQuickNewLead = () => {
    setFocusLeadId(null)
    setFocusLeadName(null)
    setActiveTab('leads')
    setOpenCreateSignal((prev) => prev + 1)
  }

  const handleJumpToLead = (leadId: string, leadName?: string) => {
    setFocusLeadId(leadId)
    setFocusLeadName(leadName || null)
    setActiveTab('leads')
  }

  const handleGlobalQuickSearch = (query: string) => {
    setFocusLeadId(null)
    setFocusLeadName(query || null)
    setActiveTab('leads')
  }

  const staffName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Staff Member')

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab !== 'leads') {
          setFocusLeadId(null)
          setFocusLeadName(null)
        }
        setActiveTab(tab)
      }}
      userRole={userRole}
      userName={staffName}
      unreadFollowupsCount={overdueFollowupsCount}
      onQuickNewLead={handleGlobalQuickNewLead}
      onQuickSearch={handleGlobalQuickSearch}
    >
      {/* Top Supabase Diagnostic Banner & Assistant */}
      <ConfigNotice />

      {/* Workshop Role Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isWorkshopMode ? '#eff6ff' : '#ecfdf5',
          border: `1px solid ${isWorkshopMode ? '#bfdbfe' : '#a7f3d0'}`,
          fontSize: '0.825rem',
          color: isWorkshopMode ? '#1e40af' : '#065f46',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            {isWorkshopMode ? <Sparkles size={14} /> : <ShieldCheck size={14} />}
            {isWorkshopMode ? 'Workshop Role Preview:' : 'Supabase Authenticated Session:'}
          </span>
          <span>
            {isWorkshopMode
              ? 'Switch perspective to test role-based UI boundaries'
              : `Logged in as ${staffName} (${userRole.toUpperCase()})`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['counsellor', 'manager', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  switchWorkshopRole(role)
                  showToast(`Switched view to ${role.toUpperCase()}`)
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: userRole === role ? '#1d4ed8' : '#93c5fd',
                  backgroundColor: userRole === role ? '#1d4ed8' : '#ffffff',
                  color: userRole === role ? '#ffffff' : '#1e40af',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #10b981',
                backgroundColor: '#ffffff',
                color: '#047857',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <LogIn size={12} /> Sign In
            </button>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      <SignInModal />

      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <DashboardView
          onNavigateToLeads={() => setActiveTab('leads')}
          onNavigateToFollowUps={() => setActiveTab('followups')}
          onQuickNewLead={handleGlobalQuickNewLead}
          onSelectLead={(lead) => handleJumpToLead(lead.id, lead.full_name)}
          onUrgentCountChange={setOverdueFollowupsCount}
        />
      )}

      {/* VIEW: LEADS */}
      {activeTab === 'leads' && (
        <LeadListView
          openCreateSignal={openCreateSignal}
          focusLeadId={focusLeadId}
          focusLeadName={focusLeadName}
        />
      )}

      {/* VIEW: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <FollowUpListView
          onJumpToLead={handleJumpToLead}
          onUrgentCountChange={setOverdueFollowupsCount}
        />
      )}

      {/* VIEW: REPORTS */}
      {activeTab === 'reports' && <ReportsView />}

      {/* VIEW: SETTINGS */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Institute Profile & System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Institute Name
                </label>
                <input
                  type="text"
                  readOnly
                  value="BrightPath Academy"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Active Staff Member
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${staffName} (${userRole.toUpperCase()})`}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Staff Email / Session
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.email || (isWorkshopMode ? 'Demo Preview Mode (No DB session)' : 'Authenticated')}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                />
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Supabase Authentication</div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                    {user
                      ? `Signed in as ${user.email}. Role permissions are enforced via PostgreSQL RLS.`
                      : 'Running in local workshop preview mode. Sign in to connect your live Supabase staff account.'}
                  </p>
                </div>
                {!user && (
                  <Button size="sm" variant="primary" onClick={() => openAuthModal('signin')}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}
