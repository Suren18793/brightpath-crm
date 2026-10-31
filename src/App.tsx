import { useState } from 'react'
import {
  Users,
  UserPlus,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Clock,
  LogIn,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type { NavTab } from './types/navigation'
import { AppLayout } from './components/layout/AppLayout'
import { StatCard } from './components/ui/StatCard'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card'
import { ConfigNotice } from './components/feedback/ConfigNotice'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { SignInModal } from './features/auth/SignInModal'
import { LeadListView } from './features/leads/LeadListView'
import type { UserRole } from './types/auth'

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [openCreateSignal, setOpenCreateSignal] = useState<number>(0)
  const { showToast } = useToast()

  const {
    role: userRole,
    profile,
    user,
    isWorkshopMode,
    switchWorkshopRole,
    openAuthModal,
  } = useAuth()

  const handleGlobalQuickNewLead = () => {
    setActiveTab('leads')
    setOpenCreateSignal((prev) => prev + 1)
  }

  const staffName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Staff Member')

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      userRole={userRole}
      userName={staffName}
      unreadFollowupsCount={2}
      onQuickNewLead={handleGlobalQuickNewLead}
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
        <>
          {/* KPI Cards Grid */}
          <div className="grid-4">
            <StatCard
              title="Total Enquiries"
              value="128"
              description="Accessible leads in pipeline"
              icon={Users}
              colorTheme="blue"
            />
            <StatCard
              title="New Leads"
              value="34"
              description="Awaiting initial outreach"
              icon={UserPlus}
              colorTheme="purple"
            />
            <StatCard
              title="Admissions"
              value="22"
              description="17.2% overall conversion"
              icon={GraduationCap}
              colorTheme="emerald"
            />
            <StatCard
              title="Overdue Follow-ups"
              value="2"
              description="Requires immediate action"
              icon={AlertCircle}
              colorTheme="rose"
            />
          </div>

          <div className="grid-2">
            {/* Recent Leads Preview */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Users size={18} />
                  <span>Recent Enquiries</span>
                </CardTitle>
                <Button size="sm" variant="secondary" onClick={() => setActiveTab('leads')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    {
                      name: 'Ananya Deshmukh',
                      course: 'JEE Advanced Masterclass',
                      source: 'Website',
                      status: 'new' as const,
                      phone: '+91 98201 12345',
                    },
                    {
                      name: 'Rohan Verma',
                      course: 'NEET Comprehensive',
                      source: 'Walk-in',
                      status: 'contacted' as const,
                      phone: '+91 98450 67890',
                    },
                    {
                      name: 'Sneha Kulkarni',
                      course: 'Full Stack Web Dev',
                      source: 'WhatsApp',
                      status: 'qualified' as const,
                      phone: '+91 99302 45678',
                    },
                  ].map((lead, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          {lead.course} • {lead.source}
                        </div>
                      </div>
                      <Badge variant={lead.status}>{lead.status.toUpperCase()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Follow-ups Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Clock size={18} />
                  <span>Urgent Follow-ups</span>
                </CardTitle>
                <Button size="sm" variant="secondary" onClick={() => setActiveTab('followups')}>
                  Go to Scheduler
                </Button>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--status-overdue-bg)',
                      border: '1px solid var(--status-overdue-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--status-overdue-text)' }}>
                        Karan Mehta — Batch Timings Call
                      </span>
                      <Badge variant="overdue">OVERDUE</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                      Scheduled for Today at 10:00 AM • NEET Comprehensive
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Tanvi Sen — Scholarship Eligibility</span>
                      <Badge variant="neutral">UPCOMING</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Tomorrow at 02:30 PM • JEE Advanced
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* VIEW: LEADS */}
      {activeTab === 'leads' && (
        <LeadListView
          openCreateSignal={openCreateSignal}
          onSelectLead={(lead) => showToast(`Selected enquiry: ${lead.full_name}`, 'info')}
        />
      )}

      {/* VIEW: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Clock size={18} />
              <span>Pending & Scheduled Follow-ups</span>
            </CardTitle>
            <Button
              variant="primary"
              size="sm"
              onClick={() => showToast('Follow-up scheduler connects in Phase 8')}
            >
              + Schedule Follow-up
            </Button>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-overdue-bg)',
                  border: '1px solid var(--status-overdue-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <Badge variant="overdue">OVERDUE (Today 10:00 AM)</Badge>
                </div>
                <h4 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--status-overdue-text)' }}>
                  Karan Mehta — NEET Comprehensive
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: '0 0 0.85rem' }}>
                  Parent enquired about morning batch availability and hostel options. Call back needed.
                </p>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => showToast('Will mark completed in Phase 8')}
                >
                  Mark Completed
                </Button>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <Badge variant="neutral">Tomorrow 02:30 PM</Badge>
                </div>
                <h4 style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>
                  Tanvi Sen — JEE Advanced
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.85rem' }}>
                  Discuss entrance scholarship test eligibility criteria and syllabus.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => showToast('Will mark completed in Phase 8')}
                >
                  Mark Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW: REPORTS */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp size={18} />
              <span>Conversion & Intake Reports</span>
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast('CSV export will be available in Phase 11')}
            >
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid-2">
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Source Performance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Website Enquiries</span>
                    <strong>48 leads (24% Conv.)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Walk-ins</span>
                    <strong>32 leads (40% Conv.)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>WhatsApp Chats</span>
                    <strong>28 leads (18% Conv.)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Referrals</span>
                    <strong>20 leads (65% Conv.)</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Course Popularity</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>JEE Masterclass</span>
                    <strong>52 enquiries</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>NEET Comprehensive</span>
                    <strong>44 enquiries</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Full Stack Web Dev</span>
                    <strong>32 enquiries</strong>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
