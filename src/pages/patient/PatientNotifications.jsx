import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { PageHeader, SkeletonLoader, EmptyState } from '../../component/ui';
import { toast } from 'sonner';
import { deleteNotification, getAllNotifications, markAllNotificationsRead, markNotificationRead } from '../../service/otherServices';

export default function PatientNotifications() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllNotifications();
    if (res.status === 'success') setItems(res.data?.notifications || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => { await markNotificationRead(id); setItems(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n)); };
  const markAll  = async ()    => { await markAllNotificationsRead(); setItems(p => p.map(n => ({ ...n, is_read: 1 }))); toast.success('All marked as read.'); };
  const del      = async (id)  => { await deleteNotification(id); setItems(p => p.filter(n => n.id !== id)); };

  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <div className="mc-page">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
        action={items.length > 0 && <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={markAll}><CheckCheck size={13} />Mark all read</button>}
      />

      <div className="mc-section">
        {loading ? <SkeletonLoader count={5} height={64} /> : items.length === 0
          ? <EmptyState icon={<Bell size={40} />} title="No notifications" description="New notifications will appear here." />
          : items.map(n => (
            <div key={n.id} className="d-flex align-items-start gap-3 p-3 mb-2"
              style={{ borderRadius: 12, background: n.is_read ? 'var(--mc-surface)' : 'var(--mc-accent-light)', border: `1px solid ${n.is_read ? 'var(--mc-border)' : 'rgba(139,30,30,0.15)'}`, transition: 'var(--mc-transition)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: n.is_read ? 'var(--mc-muted)' : 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color={n.is_read ? 'var(--mc-text-muted)' : '#fff'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: n.is_read ? 400 : 600 }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--mc-text-muted)' }}>{n.created_at}</p>
              </div>
              <div className="d-flex gap-1 flex-shrink-0">
                {!n.is_read && (
                  <button title="Mark as read" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }} onClick={() => markRead(n.id)}>
                    <Check size={15} color="var(--mc-success)" />
                  </button>
                )}
                <button title="Delete" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }} onClick={() => del(n.id)}>
                  <Trash2 size={15} color="var(--mc-danger)" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
