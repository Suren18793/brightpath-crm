import {
  UserPlus,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  MessageSquarePlus,
  UserCheck,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { ActivityRecord, ActivityType } from '../../services/activitiesService'

export interface ActivityItemProps {
  activity: ActivityRecord
  isLast?: boolean
}

function getActivityIconAndTheme(type: ActivityType): {
  icon: typeof UserPlus
  themeClass: string
  typeLabel: string
} {
  switch (type) {
    case 'created':
      return {
        icon: UserPlus,
        themeClass: 'activity-node-created',
        typeLabel: 'Lead Created',
      }
    case 'status_changed':
      return {
        icon: ArrowRightLeft,
        themeClass: 'activity-node-status',
        typeLabel: 'Status Transition',
      }
    case 'followup_added':
      return {
        icon: CalendarClock,
        themeClass: 'activity-node-followup',
        typeLabel: 'Follow-Up Scheduled',
      }
    case 'followup_completed':
      return {
        icon: CheckCircle2,
        themeClass: 'activity-node-completed',
        typeLabel: 'Follow-Up Completed',
      }
    case 'note_added':
      return {
        icon: MessageSquarePlus,
        themeClass: 'activity-node-note',
        typeLabel: 'Counselling Note',
      }
    case 'lead_reassigned':
      return {
        icon: UserCheck,
        themeClass: 'activity-node-reassigned',
        typeLabel: 'Counsellor Reassigned',
      }
    default:
      return {
        icon: Clock,
        themeClass: 'activity-node-default',
        typeLabel: 'Activity',
      }
  }
}

export function ActivityItem({ activity, isLast = false }: ActivityItemProps) {
  const { icon: Icon, themeClass, typeLabel } = getActivityIconAndTheme(
    activity.activity_type
  )

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const fromStatus =
    (activity.metadata?.from_status as string | undefined) ||
    (activity.metadata?.from as string | undefined)
  const toStatus =
    (activity.metadata?.to_status as string | undefined) ||
    (activity.metadata?.to as string | undefined)
  const lostReason =
    (activity.metadata?.lost_reason as string | undefined) ||
    (activity.metadata?.reason as string | undefined)

  return (
    <div className={`activity-timeline-item ${isLast ? 'is-last' : ''}`}>
      {/* Left Icon Rail */}
      <div className="activity-rail">
        <div className={`activity-icon-circle ${themeClass}`}>
          <Icon size={13} />
        </div>
        {!isLast && <div className="activity-connector-line" />}
      </div>

      {/* Right Content Box */}
      <div className="activity-content-card">
        <div className="activity-header-row">
          <span className="activity-type-tag">{typeLabel}</span>
          <span className="activity-timestamp">
            {formatTimestamp(activity.created_at)}
          </span>
        </div>

        <p className="activity-description">{activity.description}</p>

        {/* Status Transition Pill */}
        {activity.activity_type === 'status_changed' && fromStatus && toStatus && (
          <div className="activity-meta-pills">
            <span className="activity-status-pill">{fromStatus}</span>
            <ArrowRight size={11} className="text-slate-400" />
            <span className="activity-status-pill active">{toStatus}</span>
            {lostReason && (
              <span className="activity-lost-reason-pill">
                Reason: {lostReason}
              </span>
            )}
          </div>
        )}

        <div className="activity-actor-footer">
          <span>Recorded by </span>
          <strong>{activity.actor_name || 'Staff Member'}</strong>
        </div>
      </div>
    </div>
  )
}
