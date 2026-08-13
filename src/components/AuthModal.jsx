import React from 'react';
import { X, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  user,
  onGoogleLogin,
  onLogout,
  onUpdateProfile
}) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setNewName(user.displayName || '');
      setIsEditingName(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              <div className="status-box success" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={24} className="icon-success" />
                  <div style={{ flex: 1 }}>
                    {isEditingName ? (
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="input-field" 
                          style={{ padding: '0.2rem', fontSize: '0.9rem' }}
                        />
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={async () => {
                            if (newName.trim() && newName !== user.displayName) {
                              await onUpdateProfile(newName.trim());
                            }
                            setIsEditingName(false);
                          }}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0 }}>{user.displayName || user.email}</h4>
                        <button className="btn btn-sm" onClick={() => setIsEditingName(true)} style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}>변경</button>
                      </div>
                    )}
                    <p className="sub-desc" style={{ margin: 0, marginTop: '0.25rem' }}>동기화 중입니다.</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={onLogout} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            ) : (
              <div className="status-box">
                <div>
                  <h4>로그인이 필요합니다.</h4>
                  <p className="sub-desc">
                    로그인하여 데이터를 저장하고 동기화하세요.
                  </p>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={onGoogleLogin}>
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
