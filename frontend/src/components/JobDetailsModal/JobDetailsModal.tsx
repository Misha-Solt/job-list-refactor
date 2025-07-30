import React from 'react'
import ReactModal from 'react-modal'
import styles from './jobDetailsModal.module.css'
import { Job, Status } from '../../types/types'
import { getStatusColor } from '../../utils/StatUtil'
import moment from 'moment'
import { FaHashtag, FaCalendarCheck, FaEuroSign, FaXmark } from 'react-icons/fa6'

/* ---------- Hilfsfunktionen ---------- */

// Strikter ISO-Parse + fixes Format "DD.MM.YYYY" (mit führenden Nullen)
const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  const m = moment(iso, moment.ISO_8601, true) // strict
  return m.isValid() ? m.format('DD.MM.YYYY') : '—'
}

const fmtMoney = (v?: number) =>
  typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
    : '—'

const statusLabel: Record<Status, string> = {
  pending: 'Ausstehend',
  in_progress: 'In Bearbeitung',
  done: 'Abgeschlossen',
}

type Props = {
  isOpen: boolean
  onRequestClose: () => void
  job: Job
}

const JobDetailsModal: React.FC<Props> = ({ isOpen, onRequestClose, job }) => {
  const statusColor = getStatusColor(job.status)

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      contentLabel="Jobdetails"
      aria={{ labelledby: 'job-details-title' }}
    >
      {/* ---------- Kopfbereich ---------- */}
      <header className={styles.header}>
        <h2 id="job-details-title" className={styles.title}>
          {job.title}
        </h2>

        <div
          className={styles.statusBadge}
          style={{ backgroundColor: statusColor }}
          title={statusLabel[job.status]}
        >
          {statusLabel[job.status]}
        </div>

        <button
          className={styles.closeBtn}
          onClick={onRequestClose}
          aria-label="Schließen"
          title="Schließen"
        >
          <FaXmark aria-hidden className={styles.closeIcon} />
        </button>
      </header>

      {/* ---------- Schnell-Attribute / Chips ---------- */}
      <div className={styles.chips}>
        <div className={styles.chip} title={`Auftrag #${job.id}`}>
          <FaHashtag aria-hidden className={styles.chipIcon} />
          <span>#{job.id}</span>
        </div>

        <div className={styles.chip} title={`Fällig am ${fmtDate(job.due)}`}>
          <FaCalendarCheck aria-hidden className={styles.chipIcon} />
          <span>{fmtDate(job.due)}</span>
        </div>

        {'price' in job && (
          <div className={styles.chip} title="Preis">
            <FaEuroSign aria-hidden className={styles.chipIcon} />
            <span>{fmtMoney((job as any).price)}</span>
          </div>
        )}
      </div>

      {/* ---------- Detail-Grid ---------- */}
      <section className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.key}>Kunde</div>
          <div className={styles.value}>{job.customer ?? '—'}</div>
        </div>

        <div className={styles.item}>
          <div className={styles.key}>Status</div>
          <div className={styles.value}>{statusLabel[job.status]}</div>
        </div>

        <div className={styles.item}>
          <div className={styles.key}>Auftrags‑ID</div>
          <div className={styles.value}>#{job.id}</div>
        </div>

        <div className={styles.item}>
          <div className={styles.key}>Fällig</div>
          <div className={styles.value}>{fmtDate(job.due)}</div>
        </div>

        {'price' in job && (
          <div className={styles.item}>
            <div className={styles.key}>Preis</div>
            <div className={styles.value}>{fmtMoney((job as any).price)}</div>
          </div>
        )}

        {'assignee' in job && (job as any).assignee && (
          <div className={styles.item}>
            <div className={styles.key}>Zuständig</div>
            <div className={styles.value}>{String((job as any).assignee)}</div>
          </div>
        )}

        {'priority' in job && (job as any).priority && (
          <div className={styles.item}>
            <div className={styles.key}>Priorität</div>
            <div className={styles.value}>{String((job as any).priority)}</div>
          </div>
        )}
      </section>

      {/* ---------- Notizen ---------- */}
      {job.notes && (
        <section className={styles.notes}>
          <div className={styles.notesLabel}>Notiz:</div>
          <div className={styles.notesBody}>{job.notes}</div>
        </section>
      )}

      {/* ---------- Rohdaten (aufklappbar) ---------- */}
      <section className={styles.raw}>
        <details>
          <summary>Rohdaten (JSON)</summary>
          <pre className={styles.code}>{JSON.stringify(job, null, 2)}</pre>
        </details>
      </section>
    </ReactModal>
  )
}

export default JobDetailsModal
