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
  const [showKeyForm, setShowKeyForm] = useState(!firebaseStatus.isConfigured);

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
    alert('Firebase 설정이 저장되었습니다.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Cloud size={20} /> Firebase Spark 동기화 설정
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
                  <h4>로그인 상태 (Firebase Cloud Sync)</h4>
                  <p className="user-email-text">{user.email || user.displayName}</p>
                  <p className="sub-desc">시간표 변경사항이 실시간으로 Firebase Firestore에 자동 보관됩니다.</p>
                </div>
                <button className="btn btn-sm btn-danger" onClick={onLogout}>
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            ) : (
              <div className="status-box warning">
                <AlertCircle size={24} className="icon-warning" />
                <div>
                  <h4>현재 로컬 저장소 모드 (비로그인)</h4>
                  <p className="sub-desc">
                    {firebaseStatus.isConfigured
                      ? 'Firebase가 연결되어 있습니다. 아래 구글 로그인을 눌러 데이터를 클라우드에 보관하세요.'
                      : 'Firebase 키가 설정되지 않아 데이터가 브라우저 LocalStorage에만 저장됩니다.'}
                  </p>
                </div>
                {firebaseStatus.isConfigured && (
                  <button className="btn btn-primary" onClick={onGoogleLogin}>
                    <LogIn size={16} /> 구글 계정으로 로그인
                  </button>
                )}
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Firebase Key Config Toggle */}
          <div className="config-section">
            <div className="config-header" onClick={() => setShowKeyForm(!showKeyForm)}>
              <h3><Key size={16} /> Firebase Project 설정 키 {firebaseStatus.isConfigured ? '(설정됨)' : '(설정 필요)'}</h3>
              <span className="toggle-text">{showKeyForm ? '접기 ▲' : '열기 ▼'}</span>
            </div>

            {showKeyForm && (
              <form onSubmit={handleSaveKeys} className="key-form">
                <p className="help-text">
                  Firebase 콘솔 (Spark 무료 플랜)에서 생성한 프로젝트의 SDK Config 값(apiKey, projectId)을 넣으시면
                  로그인 및 Firestore 연동이 활성화됩니다.
                </p>

                <div className="form-group">
                  <label className="form-label">apiKey *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">projectId *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="my-routine-app-1234"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">authDomain (선택)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="my-routine-app-1234.firebaseapp.com"
                    value={authDomain}
                    onChange={e => setAuthDomain(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-accent full-width">
                  Firebase 설정 키 저장
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
