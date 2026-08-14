import { Plus, Calendar, BarChart2, Cloud, FileJson, Trash2, CheckSquare, Maximize, Moon, Sun } from 'lucide-react';
import { calculateCategoryStats } from '../utils/timeUtils';
import { useLanguage } from '../context/LanguageContext';

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
  onTabChange,
  isDarkMode,
  onToggleDarkMode
}) {
  const { lang, t } = useLanguage();
  const safeCategories = categories || {};
  const stats = calculateCategoryStats(blocks, safeCategories);

  return (
    <header className="header-container">
      <div className="header-top-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="brand-title" style={{ margin: 0 }}>{t('brand_title')}</h1>
            <button 
              className="btn btn-sm" 
              onClick={onToggleDarkMode} 
              title={isDarkMode ? (t('light_mode') + " 모드로 전환") : (t('dark_mode') + " 모드로 전환")}
              style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{isDarkMode ? t('light_mode') : t('dark_mode')}</span>
            </button>
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
              const name = prompt(t('prompt_rename_plan'), plan?.name);
              if (name) onRenamePlan(currentPlanId, name);
            }} title={t('plan_rename')}>{t('plan_rename')}</button>
            <button className="btn btn-sm" onClick={() => {
              const name = prompt(t('prompt_new_plan'));
              if (name) onCreatePlan(name);
            }} title={t('plan_add')}>{t('plan_add')}</button>
            <button className="btn btn-sm" style={{ color: 'var(--color-red)' }} onClick={() => {
              if (confirm(t('confirm_delete_plan'))) {
                onDeletePlan(currentPlanId);
              }
            }} title={t('plan_delete')}>{t('plan_delete')}</button>
          </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn"
              onClick={() => onTabChange('personal')}
              style={{
                backgroundColor: activeTab === 'personal' ? '#f1f5f9' : 'white',
                color: 'var(--text-main)',
                border: '2px solid var(--border-main)',
                boxShadow: activeTab === 'personal' ? 'none' : 'var(--shadow-hard-sm)',
                transform: activeTab === 'personal' ? 'translate(2px, 2px)' : 'none',
                fontWeight: '900',
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {t('my_schedule')}
            </button>
            <button 
              className="btn"
              onClick={() => onTabChange('shared')}
              style={{
                backgroundColor: activeTab === 'shared' ? '#f1f5f9' : 'white',
                color: 'var(--text-main)',
                border: '2px solid var(--border-main)',
                boxShadow: activeTab === 'shared' ? 'none' : 'var(--shadow-hard-sm)',
                transform: activeTab === 'shared' ? 'translate(2px, 2px)' : 'none',
                fontWeight: '900',
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {t('shared_schedule')}
            </button>
          </div>
          
          <div className="auth-status-badge" onClick={onOpenAuthModal} title={t('profile_settings')}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="user-logged-in">
                <Cloud size={16} className="cloud-icon active" />
                <span className="user-email">{user.email || user.displayName}</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 'bold' }}>{t('profile_settings')}</span>
            </div>
          ) : (
            <span className="user-logged-out">
              <Cloud size={16} className="cloud-icon" />
              <span>{t('login')}</span>
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
            <Plus size={18} /> {t('add_block')}
          </button>

          {isDeleteMode ? (
            <>
              <button className="btn" onClick={onToggleDeleteMode}>
                {t('cancel')}
              </button>
              <button className="btn btn-danger" onClick={onConfirmDelete}>
                <CheckSquare size={16} /> {t('confirm_delete')}
              </button>
            </>
          ) : (
            <button className="btn" onClick={onToggleDeleteMode}>
              <Trash2 size={16} /> {t('quick_delete')}
            </button>
          )}

          <button className="btn" onClick={onToggleWeekend}>
            <Calendar size={16} />
            {showWeekend ? t('weekday_5days') : t('weekday_7days')}
          </button>

          <button className="btn" onClick={onOpenAnalyticsModal}>
            <BarChart2 size={16} /> {t('time_analytics')}
          </button>

          <button className="btn" onClick={onOpenBackupModal}>
            <FileJson size={16} /> {t('backup_restore')}
          </button>

          <button className="btn" onClick={onToggleFullscreen} title={`${t('fullscreen')} (f)`}>
            <Maximize size={16} /> {t('fullscreen')}
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="quick-stats-bar" title="카테고리별 주간 총 시간">
          {Object.values(safeCategories).filter(Boolean).map(cat => {
            const label = (lang === 'en' && t(`cat_${cat.id}`)) ? t(`cat_${cat.id}`) : cat.label;
            return (
              <span key={cat.id} className="stat-pill">
                <span className="stat-pill-label">{label}</span>
                <strong className="stat-pill-value">{stats[cat.id]}h</strong>
              </span>
            );
          })}
        </div>
      </div>
      )}
    </header>
  );
}
