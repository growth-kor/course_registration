import React from 'react';
import { X, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  user,
  onGoogleLogin,
  onLogout
}) {
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
              <div className="status-box success">
                <CheckCircle2 size={24} className="icon-success" />
                <div>
                  <h4>{user.email || user.displayName}</h4>
                  <p className="sub-desc">동기화 중입니다.</p>
                </div>
                <button className="btn btn-sm btn-danger" onClick={onLogout} style={{ marginTop: '0.75rem' }}>
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
