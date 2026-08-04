import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader, EmptyState } from '../../component/ui';
import { deleteNotification, getAllNotifications, markAllNotificationsRead, markNotificationRead } from '../../service/otherServices';

export default function AdminNotifications() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllNotifications();
    if (res.status === 'success') setItems(res.data?.notifications || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setItems(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    setItems(p => p.map(n => ({ ...n, is_read: 1 })));
    toast.success('All marked as read.');
  };

  const del = async (id) => {
    await deleteNotification(id);
    setItems(p => p.filter(n => n.id !== id));
  };

  return (
    <div className="mc-page">
      <PageHeader title="Notifications" action={items.length > 0 && <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={markAll}><CheckCheck size={13} />Mark all read</button>} />
      <div className="mc-section">
        {loading ? <SkeletonLoader count={5} height={60} /> : items.length === 0
          ? <EmptyState icon={<Bell size={40} />} title="No notifications" description="You're all caught up!" />
          : items.map(n => (
            <div key={n.id} className="d-flex align-items-start gap-3 p-3 mb-1" style={{ borderRadius: 10, background: n.is_read ? 'transparent' : 'var(--mc-accent-light)', border: '1px solid var(--mc-border)', transition: 'var(--mc-transition)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.is_read ? 'var(--mc-muted)' : 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color={n.is_read ? 'var(--mc-text-muted)' : '#fff'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: n.is_read ? 400 : 600 }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>{n.message}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--mc-text-muted)', marginTop: 4 }}>{n.created_at}</p>
              </div>
              <div className="d-flex gap-1">
                {!n.is_read && <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', padding: 4 }} onClick={() => markRead(n.id)}><Check size={14} color="var(--mc-success)" /></button>}
                <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', padding: 4 }} onClick={() => del(n.id)}><Trash2 size={14} color="var(--mc-danger)" /></button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
