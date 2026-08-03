import React, { useState } from 'react';
import { X, Cloud, Key, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStoredFirebaseConfig } from '../firebase/config';

export function AuthModal({
  isOpen,
  onClose,
  user,
  firebaseStatus,
  onUpdateKeys,
  onGoogleLogin,
  onLogout
}) {
  if (!isOpen) return null;

  const storedConfig = getStoredFirebaseConfig() || {};
  const [apiKey, setApiKey] = useState(storedConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(storedConfig.authDomain || '');
  const [projectId, setProjectId] = useState(storedConfig.projectId || '');
  const [showKeyForm, setShowKeyForm] = useState(false);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('Firebase apiKey와 projectId를 입력해 주세요.');
      return;
    }
    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim()
    };
    onUpdateKeys(newConfig);
    alert('Firebase 키가 저장되었습니다.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Cloud size={20} /> 구글 로그인 & 클라우드 동기화
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="auth-modal-body">
          {/* User Status Card */}
          <div className="auth-status-card">
            {user ? (
              <div className="status-box success">
                <CheckCircle2 size={24} className="icon-success" />
                <div>
                  <h4>구글 계정 동기화 중</h4>
                  <p className="user-email-text">{user.email || user.displayName}</p>
                  <p className="sub-desc">시간표 변경사항이 클라우드 DB에 실시간 보관됩니다.</p>
                </div>
                <button className="btn btn-sm btn-danger" onClick={onLogout}>
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            ) : (
              <div className="status-box warning">
                <AlertCircle size={24} className="icon-warning" />
                <div>
                  <h4>현재 로컬 저장 모드 (비로그인)</h4>
                  <p className="sub-desc">
                    구글 로그인 시 작성된 주간 일정과 자습 세부 체크리스트가 클라우드에 영구 동기화됩니다.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={onGoogleLogin}>
                  <LogIn size={16} /> 구글 계정으로 로그인
                </button>
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Firebase Key Config Drawer (Collapsed by Default) */}
          <div className="config-section">
            <div className="config-header" onClick={() => setShowKeyForm(!showKeyForm)}>
              <h3><Key size={16} /> Firebase Project 설정 키 변경 (개발자용)</h3>
              <span className="toggle-text">{showKeyForm ? '접기 ▲' : '열기 ▼'}</span>
            </div>

            {showKeyForm && (
              <form onSubmit={handleSaveKeys} className="key-form" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">apiKey *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">projectId *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">authDomain</label>
                  <input
                    type="text"
                    className="input-field"
                    value={authDomain}
                    onChange={e => setAuthDomain(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-accent full-width margin-top">
                  설정 저장
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
