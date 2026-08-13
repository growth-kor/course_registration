import React from 'react';
import { Plus, Calendar, BarChart2, Cloud, FileJson, Trash2, CheckSquare, Maximize } from 'lucide-react';
import { calculateCategoryStats } from '../utils/timeUtils';

export function Header({
  plans,
  currentPlanId,
  onSelectPlan,
  onCreatePlan,
  onRenamePlan,
  onDeletePlan,
  blocks,
  showWeekend,
  onToggleWeekend,
  onOpenAddModal,
  onOpenAnalyticsModal,
  onOpenAuthModal,
  onOpenBackupModal,
  user,
  firebaseStatus,
  isDeleteMode,
  onToggleDeleteMode,
  onConfirmDelete,
  onToggleFullscreen,
  categories,
  activeTab,
  onTabChange
}) {
  const safeCategories = categories || {};
  const stats = calculateCategoryStats(blocks, safeCategories);

  return (
    <header className="header-container">
      <div className="header-top-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="brand-section">
            <h1 className="brand-title" style={{ marginRight: '1rem' }}>주간 일정 플래너</h1>
          </div>
          
          {activeTab === 'personal' && (
            <div className="plan-selector-container" style={{ margin: 0 }}>
            <select
              className="plan-dropdown"
              value={currentPlanId}
              onChange={(e) => onSelectPlan(e.target.value)}
            >
              {(Array.isArray(plans) ? plans : []).filter(Boolean).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn btn-sm" onClick={() => {
              const plan = plans.find(p => p.id === currentPlanId);
              const name = prompt('플랜 이름 변경:', plan?.name);
              if (name) onRenamePlan(currentPlanId, name);
            }} title="이름 변경">이름변경</button>
            <button className="btn btn-sm" onClick={() => {
              const name = prompt('새 플랜 이름을 입력하세요:');
              if (name) onCreatePlan(name);
            }} title="새 플랜 추가">추가</button>
            <button className="btn btn-sm" style={{ color: 'var(--color-red)' }} onClick={() => {
              if (confirm('현재 플랜을 삭제하시겠습니까? (삭제 후 복구 불가)')) {
                onDeletePlan(currentPlanId);
              }
            }} title="플랜 삭제">삭제</button>
          </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '0.25rem', borderRadius: '4px' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'personal' ? 'btn-primary' : ''}`}
              onClick={() => onTabChange('personal')}
              style={{ border: 'none', boxShadow: activeTab === 'personal' ? 'var(--shadow-hard-sm)' : 'none' }}
            >
              🗓️ 내 시간표
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'shared' ? 'btn-primary' : ''}`}
              onClick={() => onTabChange('shared')}
              style={{ border: 'none', boxShadow: activeTab === 'shared' ? 'var(--shadow-hard-sm)' : 'none' }}
            >
              👥 공유 시간표
            </button>
          </div>
          
          <div className="auth-status-badge" onClick={onOpenAuthModal} title="로그인 설정">
          {user ? (
            <span className="user-logged-in">
              <Cloud size={16} className="cloud-icon active" />
              <span className="user-email">{user.email || user.displayName}</span>
            </span>
          ) : (
            <span className="user-logged-out">
              <Cloud size={16} className="cloud-icon" />
              <span>로그인</span>
            </span>
          )}
        </div>
      </div>
      </div>

      {activeTab === 'personal' && (
      <div className="header-bottom-row">
        {/* Control Buttons */}
        <div className="control-buttons">
          <button className="btn btn-primary" onClick={onOpenAddModal} disabled={isDeleteMode}>
            <Plus size={18} /> 새 블록 기입
          </button>

          {isDeleteMode ? (
            <>
              <button className="btn" onClick={onToggleDeleteMode}>
                취소
              </button>
              <button className="btn btn-danger" onClick={onConfirmDelete}>
                <CheckSquare size={16} /> 확인 (삭제)
              </button>
            </>
          ) : (
            <button className="btn" onClick={onToggleDeleteMode}>
              <Trash2 size={16} /> 빠른 삭제
            </button>
          )}

          <button className="btn" onClick={onToggleWeekend}>
            <Calendar size={16} />
            {showWeekend ? '월~금 5일만 보기' : '월~일 전체 보기'}
          </button>

          <button className="btn" onClick={onOpenAnalyticsModal}>
            <BarChart2 size={16} /> 시간 분석
          </button>

          <button className="btn" onClick={onOpenBackupModal}>
            <FileJson size={16} /> 백업/복원
          </button>

          <button className="btn" onClick={onToggleFullscreen} title="전체화면 (f)">
            <Maximize size={16} /> 전체화면
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="quick-stats-bar">
          {Object.values(safeCategories).filter(Boolean).map(cat => (
            <span key={cat.id} className="stat-pill">
              {cat.label} <strong>{stats[cat.id]}h</strong>
            </span>
          ))}
        </div>
      </div>
      )}
    </header>
  );
}
