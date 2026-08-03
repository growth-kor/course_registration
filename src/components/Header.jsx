import React from 'react';
import { Plus, Calendar, BarChart2, Cloud, FileJson } from 'lucide-react';
import { calculateCategoryStats } from '../utils/timeUtils';

export function Header({
  blocks,
  showWeekend,
  onToggleWeekend,
  onOpenAddModal,
  onOpenAnalyticsModal,
  onOpenAuthModal,
  onOpenBackupModal,
  user,
  firebaseStatus
}) {
  const stats = calculateCategoryStats(blocks);

  return (
    <header className="header-container">
      <div className="header-top-row">
        <div className="brand-section">
          <div className="brand-badge">GRID ROUTINE</div>
          <h1 className="brand-title">주간 고정 일정 & 자습 플래너</h1>
        </div>

        <div className="auth-status-badge" onClick={onOpenAuthModal} title="클릭하여 구글 로그인 및 클라우드 동기화">
          {user ? (
            <span className="user-logged-in">
              <Cloud size={16} className="cloud-icon active" />
              <span className="user-email">{user.email || user.displayName || 'Google 계정'}</span>
              <span className="status-tag sync">CLOUD SYNC ON</span>
            </span>
          ) : (
            <span className="user-logged-out">
              <Cloud size={16} className="cloud-icon" />
              <span>로그인 (클라우드 동기화)</span>
              <span className="status-tag local">LOCAL</span>
            </span>
          )}
        </div>
      </div>

      <div className="header-bottom-row">
        {/* Quick Stats Bar */}
        <div className="quick-stats-bar">
          <span className="stat-pill self-study">
            <span className="dot yellow"></span> 자습 <strong>{stats.self_study}h</strong>
          </span>
          <span className="stat-pill class">
            <span className="dot sky"></span> 수업 <strong>{stats.class}h</strong>
          </span>
          <span className="stat-pill routine">
            <span className="dot mint"></span> 루틴 <strong>{stats.routine}h</strong>
          </span>
          <span className="stat-pill total">
            총 <strong>{stats.total}h</strong> / 주간
          </span>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={18} /> 새 블록 기입
          </button>

          <button className="btn" onClick={onToggleWeekend}>
            <Calendar size={16} />
            {showWeekend ? '월~금 5일만 보기' : '월~일 7일 전체 보기'}
          </button>

          <button className="btn" onClick={onOpenAnalyticsModal}>
            <BarChart2 size={16} /> 시간 분석
          </button>

          <button className="btn" onClick={onOpenBackupModal}>
            <FileJson size={16} /> 백업/복원
          </button>
        </div>
      </div>
    </header>
  );
}
