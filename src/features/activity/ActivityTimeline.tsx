import { History, Clock } from 'lucide-react'
import type { ActivityRecord } from '../../services/activitiesService'
import { ActivityItem } from './ActivityItem'

export interface ActivityTimelineProps {
  activities: ActivityRecord[]
  isLoading: boolean
}

export function ActivityTimeline({
  activities,
  isLoading,
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="activity-timeline-loading">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="activity-skeleton-row">
            <div className="skeleton-box" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-box skeleton-text-primary" style={{ width: '55%' }} />
              <div className="skeleton-box skeleton-text-sub" style={{ width: '85%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="activity-empty-state">
        <Clock size={24} className="text-slate-400" />
        <p>No audit activity events recorded for this lead yet.</p>
      </div>
    )
  }

  return (
    <div className="activity-timeline-container">
      <div className="activity-timeline-header">
        <div className="activity-section-title">
          <History size={15} />
          <span>Audit Activity Timeline ({activities.length})</span>
        </div>
        <span className="activity-section-subtitle">
          Immutable log of status updates, notes & follow-ups
        </span>
      </div>

      <div className="activity-timeline-list">
        {activities.map((item, idx) => (
          <ActivityItem
            key={item.id}
            activity={item}
            isLast={idx === activities.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
