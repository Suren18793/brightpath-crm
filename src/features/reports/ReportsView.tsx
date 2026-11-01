import { useState, useEffect, useCallback } from 'react'
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react'
import {
  reportsService,
  type ReportsSummary,
} from '../../services/reportsService'
import {
  exportLeadsToCsv,
  exportReportsSummaryToCsv,
} from '../../utils/csvExport'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const EMPTY_REPORTS: ReportsSummary = {
  totalLeads: 0,
  totalActive: 0,
  totalConverted: 0,
  totalLost: 0,
  overallConversionRate: 0,
  completedFollowUpsCount: 0,
  pendingFollowUpsCount: 0,
  overdueFollowUpsCount: 0,
  sourceEffectiveness: [],
  counsellorWorkload: [],
  courseDemand: [],
  exportableLeads: [],
  isDemoFallback: false,
}

export function ReportsView() {
  const { role, user } = useAuth()
  const { showToast } = useToast()

  const [report, setReport] = useState<ReportsSummary>(EMPTY_REPORTS)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await reportsService.getReportsSummary(role, user?.id)
      setReport(data)
    } finally {
      setIsLoading(false)
    }
  }, [role, user?.id])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleExportLeadsCsv = () => {
    if (report.exportableLeads.length === 0) {
      showToast('No leads available in your current scope to export.', 'info')
      return
    }
    const count = exportLeadsToCsv(report.exportableLeads)
    showToast(
      `Exported ${count} student lead${count === 1 ? '' : 's'} to sanitized CSV.`,
      'success'
    )
  }

  const handleExportSummaryCsv = () => {
    exportReportsSummaryToCsv(
      report.sourceEffectiveness,
      report.counsellorWorkload
    )
    showToast(
      'Exported Source Effectiveness & Counsellor Workload summary CSV.',
      'success'
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      {/* Page Title & CSV Export Header */}
      <div className="page-title-row">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <h1 className="page-title">Admissions Reports & Audit Export</h1>
            <span
              className="badge badge-contacted"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ShieldCheck size={12} />
              {role === 'counsellor'
                ? 'Personal Counsellor Scope'
                : `Institute-Wide Report (${role.toUpperCase()})`}
            </span>
          </div>
          <p className="page-subtitle">
            Reconciled acquisition source ROI, counsellor workload performance, and formula-sanitized CSV exports
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadReports}
            disabled={isLoading}
            title="Refresh report calculations"
          >
            <RefreshCw
              size={15}
              className={isLoading ? 'spin-icon' : undefined}
            />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportSummaryCsv}
            disabled={isLoading}
            title="Download Source & Counsellor Summary tables as CSV"
          >
            <FileSpreadsheet size={15} />
            Export Summary CSV
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportLeadsCsv}
            disabled={isLoading || report.exportableLeads.length === 0}
            title="Download sanitized audit CSV of all accessible student leads"
          >
            <Download size={15} />
            Export Leads CSV ({report.totalLeads})
          </button>
        </div>
      </div>

      {/* Reconciled Summary Strip */}
      <div className="grid-4">
        <div className="kpi-card-v2">
          <div className="kpi-v2-top">
            <span className="kpi-v2-label">Accessible Leads</span>
            <div className="kpi-v2-icon icon-blue">
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-v2-value">{report.totalLeads}</div>
          <div className="kpi-v2-sub">
            {report.totalActive} active in pipeline • {report.totalLost} lost
          </div>
        </div>

        <div className="kpi-card-v2">
          <div className="kpi-v2-top">
            <span className="kpi-v2-label">Converted Admissions</span>
            <div className="kpi-v2-icon icon-emerald">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="kpi-v2-value">{report.totalConverted}</div>
          <div className="kpi-v2-sub">Confirmed student enrollments</div>
        </div>

        <div className="kpi-card-v2">
          <div className="kpi-v2-top">
            <span className="kpi-v2-label">Overall Conversion %</span>
            <div className="kpi-v2-icon icon-amber">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-v2-value">
            {report.overallConversionRate.toFixed(1)}%
          </div>
          <div className="kpi-v2-sub">
            {report.totalConverted} of {report.totalLeads} leads converted
          </div>
        </div>

        <div className="kpi-card-v2">
          <div className="kpi-v2-top">
            <span className="kpi-v2-label">Completed Follow-Ups</span>
            <div className="kpi-v2-icon icon-indigo">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-v2-value">{report.completedFollowUpsCount}</div>
          <div className="kpi-v2-sub">
            {report.pendingFollowUpsCount} pending ({report.overdueFollowUpsCount}{' '}
            overdue)
          </div>
        </div>
      </div>

      {/* 1. Source Effectiveness Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">
                Lead Source Effectiveness Report
              </div>
              <div className="card-subtitle">
                Enquiry volume, active pipeline, converted admissions, and conversion rate by acquisition channel
              </div>
            </div>
          </div>
          <span className="badge badge-new">6 Acquisition Channels</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Acquisition Source</th>
                  <th>Total Leads</th>
                  <th>Volume Share</th>
                  <th>Active Pipeline</th>
                  <th>Converted Admissions</th>
                  <th>Lost</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {report.sourceEffectiveness.map((row) => (
                  <tr key={row.source}>
                    <td style={{ fontWeight: 700 }}>{row.source}</td>
                    <td style={{ fontWeight: 700 }}>{row.totalLeads}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {row.sharePercentage.toFixed(1)}%
                    </td>
                    <td>
                      <span className="badge badge-contacted">
                        {row.activeLeads} active
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-converted">
                        {row.convertedLeads} converted
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {row.lostLeads}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                        }}
                      >
                        <div
                          className="source-progress-track"
                          style={{ width: 80, flexShrink: 0 }}
                        >
                          <div
                            className="source-progress-fill"
                            style={{
                              width: `${Math.min(row.conversionRate, 100)}%`,
                              background:
                                row.conversionRate >= 25
                                  ? '#10b981'
                                  : row.conversionRate > 0
                                  ? '#3b82f6'
                                  : '#cbd5e1',
                            }}
                          />
                        </div>
                        <strong style={{ fontSize: '0.82rem' }}>
                          {row.conversionRate.toFixed(1)}%
                        </strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="reports-table-footer">
                  <td>Total / Overall</td>
                  <td>{report.totalLeads}</td>
                  <td>100.0%</td>
                  <td>{report.totalActive} active</td>
                  <td>{report.totalConverted} converted</td>
                  <td>{report.totalLost}</td>
                  <td>{report.overallConversionRate.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Counsellor Workload & Performance Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">
                Counsellor Workload & Admissions Performance
              </div>
              <div className="card-subtitle">
                Assigned student enquiries, follow-up completion discipline, and admissions conversion per counsellor
              </div>
            </div>
          </div>
          <span className="badge badge-qualified">Staff Productivity</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Assigned Leads</th>
                  <th>Active Pipeline</th>
                  <th>Pending Follow-Ups</th>
                  <th>Completed Follow-Ups</th>
                  <th>Admissions (Converted)</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {report.counsellorWorkload.map((row) => (
                  <tr key={row.counsellorId}>
                    <td style={{ fontWeight: 700 }}>{row.counsellorName}</td>
                    <td>
                      <span className="badge badge-new">{row.roleLabel}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{row.assignedLeads}</td>
                    <td>{row.activeLeads}</td>
                    <td>
                      {row.pendingFollowUps}
                      {row.overdueFollowUps > 0 && (
                        <span
                          className="badge badge-lost"
                          style={{ marginLeft: '0.4rem', fontSize: '0.68rem' }}
                        >
                          {row.overdueFollowUps} overdue
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: '#047857',
                        }}
                      >
                        {row.completedFollowUps} completed
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-converted">
                        {row.convertedAdmissions} enrolled
                      </span>
                    </td>
                    <td>
                      <strong>{row.conversionRate.toFixed(1)}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Course Demand & Intake Summary */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">Course Demand & Enrollment Breakdown</div>
              <div className="card-subtitle">
                Student interest distribution and admission conversion across academic programs
              </div>
            </div>
          </div>
          <span className="badge badge-converted">
            {report.courseDemand.length} Programs
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Course / Program Interest</th>
                  <th>Total Enquiries</th>
                  <th>Active Pipeline</th>
                  <th>Converted Admissions</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {report.courseDemand.map((row) => (
                  <tr key={row.course}>
                    <td style={{ fontWeight: 700 }}>{row.course}</td>
                    <td>{row.totalLeads}</td>
                    <td>{row.activeLeads}</td>
                    <td>
                      <span className="badge badge-converted">
                        {row.convertedLeads}
                      </span>
                    </td>
                    <td>
                      <strong>{row.conversionRate.toFixed(1)}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
