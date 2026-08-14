import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Globe, Lock, AlertCircle } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchNotices, addNotice, updateNotice, deleteNotice } from '../firebase/config';

export function NoticeBoard() {
  const { user, activeRoom } = useSharedSpace();
  const { t } = useLanguage();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isWriting, setIsWriting] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isOwner = activeRoom?.ownerId === user?.uid;

  useEffect(() => {
    if (activeRoom) {
      loadNotices();
    }
  }, [activeRoom]);

  const loadNotices = async () => {
    setLoading(true);
    const fetched = await fetchNotices(activeRoom.id);
    setNotices(fetched);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    if (editNoticeId) {
      const success = await updateNotice(activeRoom.id, editNoticeId, { title, content });
      if (success) {
        setNotices(prev => prev.map(n => n.id === editNoticeId ? { ...n, title, content, updatedAt: new Date().toISOString() } : n));
        cancelEdit();
      }
    } else {
      const newNotice = await addNotice(activeRoom.id, user.uid, user.displayName || '이름 없음', title, content);
      if (newNotice) {
        setNotices(prev => [newNotice, ...prev]);
        cancelEdit();
      }
    }
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setContent(notice.content);
    setEditNoticeId(notice.id);
    setIsWriting(true);
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const success = await deleteNotice(activeRoom.id, noticeId);
      if (success) {
        setNotices(prev => prev.filter(n => n.id !== noticeId));
      }
    }
  };

  const cancelEdit = () => {
    setTitle('');
    setContent('');
    setEditNoticeId(null);
    setIsWriting(false);
  };

  if (!activeRoom) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Room Header Info */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.5rem', 
        marginBottom: '2rem', 
        paddingBottom: '2rem', 
        borderBottom: '4px solid var(--border-main)' 
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'white', 
          color: 'var(--text-main)', 
          border: '4px solid var(--border-main)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexShrink: 0, 
          backgroundImage: activeRoom.themeImageUrl ? `url(${activeRoom.themeImageUrl})` : 'none', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          boxShadow: 'var(--shadow-hard-sm)'
        }}>
          {!activeRoom.themeImageUrl && (activeRoom.isPublic ? <Globe size={32} /> : <Lock size={32} />)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeRoom.name}
            {activeRoom.isPublic ? 
              <span className="badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>{t('public')}</span> : 
              <span className="badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--text-muted)', color: 'white' }}>{t('private')}</span>
            }
          </h2>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            {activeRoom.description || t('no_description')}
          </p>
        </div>
      </div>

      {/* Notice Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
          <Megaphone size={20} /> {t('tab_notice')}
        </h3>
        
        {isOwner && !isWriting && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsWriting(true)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> {t('add_notice')}
          </button>
        )}
      </div>

      {/* Write/Edit Form */}
      {isWriting && (
        <div className="card" style={{ marginBottom: '2rem', border: '3px solid var(--border-main)' }}>
          <input 
            type="text" 
            className="form-input"
            placeholder={t('notice_title_placeholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}
          />
          <textarea 
            className="form-input"
            placeholder={t('notice_content_placeholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '150px', resize: 'vertical', marginBottom: '1rem', lineHeight: '1.6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn" onClick={cancelEdit}>취소</button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
            >
              {t('save_notice')}
            </button>
          </div>
        </div>
      )}

      {/* Notice List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t('loading_data')}
        </div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px', border: '3px solid var(--border-main)', boxShadow: 'var(--shadow-hard)' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900' }}>{t('no_notices')}</h3>
          {isOwner && <p style={{ color: 'var(--text-muted)', margin: 0 }}>방장님, 멤버들을 위한 첫 번째 공지사항을 등록해 보세요!</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map(notice => (
            <div key={notice.id} className="card" style={{ border: '3px solid var(--border-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.15rem' }}>{notice.title}</h4>
                {isOwner && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-muted)' }}
                      onClick={() => handleEdit(notice)}
                      title={t('edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-muted)' }}
                      onClick={() => handleDelete(notice.id)}
                      title={t('delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p style={{ margin: '0 0 1rem 0', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {notice.content}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-end' }}>
                {new Date(notice.createdAt).toLocaleString()}
                {notice.updatedAt && notice.updatedAt !== notice.createdAt && ' (수정됨)'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
