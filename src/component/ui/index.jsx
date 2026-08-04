import React from 'react';

// ── Skeleton Loader ────────────────────────────────────────
export function SkeletonLoader({ count = 3, height = 40 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton mb-2" style={{ height, width: '100%', borderRadius: 8 }} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Stat Card ──────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = 'var(--mc-accent)', trend, loading }) {
  if (loading) return <div className="card p-3 h-100"><div className="skeleton" style={{ height: 80 }} /></div>;
  return (
    <div className="card p-3 h-100 d-flex flex-row align-items-center gap-3" style={{ border: '1px solid var(--mc-border)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {Icon && <Icon size={22} color={color} strokeWidth={1.8} />}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--mc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{title}</p>
        <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--mc-font-heading)', color: 'var(--mc-text)', lineHeight: 1.2 }}>{value ?? '–'}</p>
        {trend != null && <p style={{ margin: 0, fontSize: '0.72rem', color: trend >= 0 ? 'var(--mc-success)' : 'var(--mc-danger)' }}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month</p>}
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: 'Pending',   cls: 'status-pending'   },
  confirmed: { label: 'Confirmed', cls: 'status-confirmed'  },
  completed: { label: 'Completed', cls: 'status-completed'  },
  cancelled: { label: 'Cancelled', cls: 'status-cancelled'  },
  rejected:  { label: 'Rejected',  cls: 'status-rejected'   },
  active:    { label: 'Active',    cls: 'status-completed'  },
  inactive:  { label: 'Inactive',  cls: 'status-cancelled'  },
};
export function StatusBadge({ status }) {
  const s = STATUS_MAP[status?.toLowerCase()] || { label: status, cls: 'status-pending' };
  return <span className={`badge ${s.cls}`} style={{ padding: '4px 10px' }}>{s.label}</span>;
}

// ── Page Header ────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
      <div>
        <h4 style={{ margin: 0, fontFamily: 'var(--mc-font-heading)', color: 'var(--mc-text)' }}>{title}</h4>
        {subtitle && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mc-text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      type="search"
      className="form-control"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ maxWidth: 280 }}
    />
  );
}

// ── Pagination ─────────────────────────────────────────────
export function PaginationBar({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="d-flex justify-content-end mt-3">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>‹</button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <li key={n} className={`page-item ${n === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onChange(n)} style={n === page ? { background: 'var(--mc-accent)', borderColor: 'var(--mc-accent)' } : {}}>{n}</button>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>›</button>
        </li>
      </ul>
    </nav>
  );
}

// ── Empty State ────────────────────────────────────────────
export function EmptyState({ icon, title = 'Nothing here', description }) {
  return (
    <div className="mc-empty py-5">
      {icon && <div className="mb-3">{icon}</div>}
      <h6>{title}</h6>
      {description && <p style={{ fontSize: '0.85rem' }}>{description}</p>}
    </div>
  );
}

// ── Appointment Card ───────────────────────────────────────
export function AppointmentCard({ appointment, actions }) {
  return (
    <div className="card p-3 mb-2">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.9rem' }}>
            {appointment.patient_name || appointment.doctor_name || 'Appointment'}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>
            {appointment.appointment_date} · {appointment.appointment_time}
          </p>
          {appointment.department_name && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{appointment.department_name}</p>
          )}
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <StatusBadge status={appointment.status} />
          {actions}
        </div>
      </div>
    </div>
  );
}

// ── Modal Wrapper ──────────────────────────────────────────
export function Modal({ show, onClose, title, description, icon: Icon, children, size = '', variant = 'default' }) {
  // Lock body scroll while open
  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  const maxW = size === 'xl' ? 860 : size === 'lg' ? 700 : size === 'sm' ? 380 : 520;
  const accentColor = variant === 'danger' ? 'var(--mc-danger)' : 'var(--mc-accent)';

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div
        className="mc-modal-dialog"
        style={{ maxWidth: maxW }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div className="mc-modal-accent-bar" style={{ background: accentColor }} />

        {/* Header */}
        <div className="mc-modal-header">
          <div className="d-flex align-items-center gap-3">
            {Icon && (
              <div className="mc-modal-icon" style={{ background: accentColor + '15', color: accentColor }}>
                <Icon size={18} strokeWidth={2} />
              </div>
            )}
            <div>
              <h5 className="mc-modal-title">{title}</h5>
              {description && <p className="mc-modal-description">{description}</p>}
            </div>
          </div>
          <button className="mc-modal-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body & Footer come from children (modal-body / modal-footer divs) */}
        <div className="mc-modal-body-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Confirm / Delete modal ─────────────────────────────────
export function ConfirmModal({ show, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', loading = false }) {
  return (
    <Modal show={show} onClose={onClose} title={title} variant={variant} size="sm">
      <div className="modal-body">
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--mc-text-secondary)', lineHeight: 1.65 }}>{message}</p>
      </div>
      <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
