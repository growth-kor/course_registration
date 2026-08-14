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
            <Cloud size={20} /> 프로필 및 계정 설정
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-status-card">
            {user ? (
              <div className="status-box success" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1.5px solid var(--border-main)', paddingBottom: '0.75rem', width: '100%' }}>
                  <CheckCircle2 size={24} className="icon-success" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '900', fontSize: '1rem' }}>{user.displayName || '이름 없음'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{user.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', textAlign: 'left' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '900', display: 'block', marginBottom: '0.3rem' }}>이름 (닉네임)</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                      className="input-field" 
                      placeholder="이름을 입력하세요"
                      style={{ width: '100%', padding: '0.5rem' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '900' }}>상태 메시지 (최대 10자)</label>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{newStatus.length}/10</span>
                    </div>
                    <input 
                      type="text" 
                      maxLength={10}
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value)} 
                      className="input-field"
                      placeholder="10자 내 한 줄 메시지"
                      style={{ width: '100%', padding: '0.5rem' }}
                    />
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={async () => {
                      const nameToUpdate = newName.trim();
                      const statusToUpdate = newStatus.trim();
                      const success = await onUpdateProfile(nameToUpdate, statusToUpdate);
                      if (success) {
                        setCurrentStatus(statusToUpdate);
                        alert("프로필이 성공적으로 저장되었습니다!");
                      } else {
                        alert("프로필 저장에 실패했습니다. 네트워크 또는 Firebase 권한을 확인해주세요.");
                      }
                    }}
                    style={{ width: '100%', justifyContent: 'center', fontWeight: '900', marginTop: '0.25rem' }}
                  >
                    프로필 저장
                  </button>
                </div>

                <div style={{ borderTop: '1.5px solid var(--border-main)', paddingTop: '0.75rem', width: '100%' }}>
                  <button className="btn btn-sm btn-danger" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
                    <LogOut size={14} /> 로그아웃
                  </button>
                </div>
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
