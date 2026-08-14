import React, { useState, useEffect } from 'react';
import { X, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { getUserProfile } from '../firebase/config';

export function AuthModal({
  isOpen,
  onClose,
  user,
  onGoogleLogin,
  onLogout,
  onUpdateProfile
}) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setNewName(user.displayName || '');
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          setCurrentStatus(profile.statusMessage || '');
          setNewStatus(profile.statusMessage || '');
        }
      });
      setIsEditingProfile(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Cloud size={20} /> 로그인
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-status-card">
            {user ? (
              <div className="status-box success" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={32} className="icon-success" />
                  <div style={{ flex: 1, width: '100%' }}>
                    {isEditingProfile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="input-field" 
                          placeholder="이름"
                          style={{ padding: '0.4rem', fontSize: '0.9rem', width: '100%' }}
                        />
                        <input 
                          type="text" 
                          value={newStatus} 
                          onChange={e => setNewStatus(e.target.value)} 
                          className="input-field"
                          placeholder="상태 메시지 (선택)"
                          style={{ padding: '0.4rem', fontSize: '0.9rem', width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={async () => {
                              const nameToUpdate = newName.trim();
                              const statusToUpdate = newStatus.trim();
                              if (nameToUpdate !== user.displayName || statusToUpdate !== currentStatus) {
                                await onUpdateProfile(nameToUpdate, statusToUpdate);
                                setCurrentStatus(statusToUpdate);
                              }
                              setIsEditingProfile(false);
                            }}
                          >
                            저장
                          </button>
                          <button className="btn btn-sm" onClick={() => setIsEditingProfile(false)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{user.displayName || user.email}</h4>
                          <button className="btn btn-sm" onClick={() => setIsEditingProfile(true)} style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}>수정</button>
                        </div>
                        {currentStatus && (
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-grid-dark)' }}>
                            "{currentStatus}"
                          </div>
                        )}
                      </div>
                    )}
                    <p className="sub-desc" style={{ margin: 0, marginTop: '1rem', fontWeight: 'bold' }}>클라우드 동기화 됨</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={onLogout} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            ) : (
              <div className="status-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div>
                  <h4>로그인이 필요합니다.</h4>
                  <p className="sub-desc" style={{ marginTop: '0.5rem' }}>
                    로그인하여 데이터를 저장하고 동기화하세요.
                  </p>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={onGoogleLogin}>
                  <LogIn size={16} /> 구글 로그인
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
