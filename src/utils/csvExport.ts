import type { Lead } from '../types/leads'
import type { SourceEffectivenessRow, CounsellorWorkloadRow } from '../services/reportsService'

/**
 * Sanitizes a single cell value for RFC 4180 CSV output and prevents
 * OWASP CSV / Formula Injection (=, +, -, @, \t, \r) in Excel, Numbers & Google Sheets.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""'
  }

  let str = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  // Prevent spreadsheet formula execution on cells starting with =, +, -, @, tab, CR
  // (Also prevents Excel from turning "+91 98201..." phone numbers into #ERROR! formulas)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }

  // Escape internal double quotes per RFC 4180
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

function triggerCsvDownload(csvContent: string, filename: string): void {
  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel & Apple Numbers detect UTF-8 automatically
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getDateStamp(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Exports an array of Lead records to a sanitized, Excel-ready CSV file.
 * Returns the number of leads exported.
 */
export function exportLeadsToCsv(
  leads: Lead[],
  customFilename?: string
): number {
  const headers = [
    'Lead ID',
    'Student Full Name',
    'Phone Number',
    'Email Address',
    'Course Interest',
    'Acquisition Source',
    'Pipeline Status',
    'Assigned Counsellor',
    'Lost Reason',
    'Counselling Notes',
    'Next Follow-Up Due',
    'Created At',
    'Updated At',
  ]

  const rows = leads.map((lead) => [
    sanitizeCsvCell(lead.id),
    sanitizeCsvCell(lead.full_name),
    sanitizeCsvCell(lead.phone),
    sanitizeCsvCell(lead.email || ''),
    sanitizeCsvCell(lead.course_interest),
    sanitizeCsvCell(lead.source),
    sanitizeCsvCell(lead.status),
    sanitizeCsvCell(lead.assignee_name || 'Unassigned'),
    sanitizeCsvCell(lead.lost_reason || ''),
    sanitizeCsvCell(lead.notes || ''),
    sanitizeCsvCell(
      lead.next_followup_due
        ? new Date(lead.next_followup_due).toLocaleString()
        : ''
    ),
    sanitizeCsvCell(new Date(lead.created_at).toLocaleString()),
    sanitizeCsvCell(new Date(lead.updated_at).toLocaleString()),
  ])

  const csvString = [
    headers.map((h) => sanitizeCsvCell(h)).join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n')

  const filename =
    customFilename || `brightpath-leads-audit-${getDateStamp()}.csv`
  triggerCsvDownload(csvString, filename)
  return leads.length
}

/**
 * Exports the Source Effectiveness & Counsellor Workload summary tables to CSV.
 */
export function exportReportsSummaryToCsv(
  sourceRows: SourceEffectivenessRow[],
  workloadRows: CounsellorWorkloadRow[],
  customFilename?: string
): void {
  const lines: string[] = []

  // Section 1: Source Effectiveness
  lines.push(sanitizeCsvCell('BRIGHTPATH CRM - SOURCE EFFECTIVENESS REPORT'))
  lines.push(
    [
      'Acquisition Source',
      'Total Enquiries',
      'Active Pipeline (New/Contacted/Qualified)',
      'Converted Admissions',
      'Lost Enquiries',
      'Conversion Rate (%)',
    ]
      .map(sanitizeCsvCell)
      .join(',')
  )

  for (const row of sourceRows) {
    lines.push(
      [
        sanitizeCsvCell(row.source),
        sanitizeCsvCell(row.totalLeads),
        sanitizeCsvCell(row.activeLeads),
        sanitizeCsvCell(row.convertedLeads),
        sanitizeCsvCell(row.lostLeads),
        sanitizeCsvCell(`${row.conversionRate.toFixed(1)}%`),
      ].join(',')
    )
  }

  lines.push('')

  // Section 2: Counsellor Workload
  lines.push(sanitizeCsvCell('BRIGHTPATH CRM - COUNSELLOR WORKLOAD & PERFORMANCE'))
  lines.push(
    [
      'Counsellor Name',
      'Role',
      'Assigned Leads',
      'Active Pipeline',
      'Pending Follow-Ups',
      'Overdue Follow-Ups',
      'Completed Follow-Ups',
      'Converted Admissions',
      'Conversion Rate (%)',
    ]
      .map(sanitizeCsvCell)
      .join(',')
  )

  for (const row of workloadRows) {
    lines.push(
      [
        sanitizeCsvCell(row.counsellorName),
        sanitizeCsvCell(row.roleLabel),
        sanitizeCsvCell(row.assignedLeads),
        sanitizeCsvCell(row.activeLeads),
        sanitizeCsvCell(row.pendingFollowUps),
        sanitizeCsvCell(row.overdueFollowUps),
        sanitizeCsvCell(row.completedFollowUps),
        sanitizeCsvCell(row.convertedAdmissions),
        sanitizeCsvCell(`${row.conversionRate.toFixed(1)}%`),
      ].join(',')
    )
  }

  const filename =
    customFilename || `brightpath-performance-report-${getDateStamp()}.csv`
  triggerCsvDownload(lines.join('\r\n'), filename)
}
