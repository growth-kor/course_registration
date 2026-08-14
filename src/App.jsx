import React, { useState } from 'react';
import { useSchedule } from './hooks/useSchedule';
import { Header } from './components/Header';
import { WeeklyGrid } from './components/WeeklyGrid';
import { BlockModal } from './components/BlockModal';
import { AuthModal } from './components/AuthModal';
import { TimeAnalyticsModal } from './components/TimeAnalyticsModal';
import { BackupModal } from './components/BackupModal';
import { SharedSpace } from './components/SharedSpace';
import { FooterCard } from './components/FooterCard';
import { UserGuideModal } from './components/UserGuideModal';
import { Minimize } from 'lucide-react';
import { updateUserProfile } from './firebase/config';
import { useLanguage } from './context/LanguageContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', border: '3px solid var(--border-main)', margin: '2rem', boxShadow: 'var(--shadow-hard)' }}>
          <h2 style={{ fontWeight: '900', marginBottom: '1rem' }}>화면을 불러오는 중 오류가 발생했습니다</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{this.state.error?.message || '알 수 없는 오류'}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
          >
            기본 화면으로 초기화 및 새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const {
    plans,
    currentPlanId,
    setCurrentPlanId,
    createPlan,
    renamePlan,
    deletePlan,
    blocks,
    settings,
    user,
    firebaseStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addBlock,
    updateBlock,
    deleteBlock,
    resetToSample,
    importBlocks,
    toggleWeekend,
    updateFirebaseKeys,
    handleGoogleLogin,
    handleLogout
  } = useSchedule();

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('activeTab') || 'personal'); // 'personal' or 'shared'

  React.useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const { t } = useLanguage();

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('brutalist_dark_mode') === 'true';
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('brutalist_dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [initialTimeSlots, setInitialTimeSlots] = useState([]);
  const [selectedEmptySlots, setSelectedEmptySlots] = useState([]);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [pendingDeleteBlockIds, setPendingDeleteBlockIds] = useState([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainGridRef = React.useRef(null);
  const isSnappingRef = React.useRef(false);

  React.useEffect(() => {
    // Reset scroll to top on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const handleWheel = (e) => {
      if (activeTab !== 'personal' || isSnappingRef.current || isFullscreen) return;

      const gridEl = mainGridRef.current;
      if (!gridEl) return;

      const gridRect = gridEl.getBoundingClientRect();
      const currentScroll = window.scrollY;

      // When at the top (seeing header) and scrolling down:
      if (e.deltaY > 15 && currentScroll < 80 && gridRect.top > 0) {
        isSnappingRef.current = true;
        const targetY = currentScroll + gridRect.top - 16; // 16px clean gap from viewport top
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
        setTimeout(() => {
          isSnappingRef.current = false;
        }, 600);
      }
      // When at the timetable top and scrolling up:
      else if (e.deltaY < -15 && currentScroll <= gridRect.top + currentScroll + 30 && currentScroll > 10) {
        if (gridRect.top >= 0) {
          isSnappingRef.current = true;
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          setTimeout(() => {
            isSnappingRef.current = false;
          }, 600);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeTab, isFullscreen]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    const handleKeyDown = (e) => {
      // Allow 'f' key to toggle fullscreen, but only if not typing in an input
      if (e.code === 'KeyF' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handlers
  const handleOpenAddModalForSelection = () => {
    if (selectedEmptySlots.length === 0) {
      setSelectedBlock(null);
      setInitialTimeSlots([{ id: `ts_${Date.now()}`, dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }]);
      setIsAddModalOpen(true);
      return;
    }
    
    // Group contiguous slots per day
    const grouped = {};
    selectedEmptySlots.forEach(s => {
      if (!grouped[s.day]) grouped[s.day] = [];
      grouped[s.day].push(s.time);
    });

    const mergedSlots = [];
    Object.keys(grouped).forEach(day => {
      const times = grouped[day].sort();
      let currentStart = times[0];
      let currentEnd = null;

      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        const [h, m] = t.split(':').map(Number);
        const endH = Math.min(24, h + 1);
        const expectedEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        if (i === times.length - 1) {
          mergedSlots.push({ id: `ts_${Date.now()}_${Math.random()}`, dayOfWeek: Number(day), startTime: currentStart, endTime: expectedEnd });
        } else {
          const nextT = times[i + 1];
          if (expectedEnd !== nextT) {
            mergedSlots.push({ id: `ts_${Date.now()}_${Math.random()}`, dayOfWeek: Number(day), startTime: currentStart, endTime: expectedEnd });
            currentStart = nextT;
          }
        }
      }
    });

    setSelectedBlock(null);
    setInitialTimeSlots(mergedSlots);
    setIsAddModalOpen(true);
    setSelectedEmptySlots([]);
  };

  const handleEmptySlotClick = (day, time) => {
    setSelectedEmptySlots(prev => {
      const exists = prev.find(s => s.day === day && s.time === time);
      if (exists) {
        return prev.filter(s => !(s.day === day && s.time === time));
      } else {
        return [...prev, { day, time }];
      }
    });
  };

  const handleBlockClick = (block) => {
    if (isDeleteMode) {
      setPendingDeleteBlockIds(prev =>
        prev.includes(block.id)
          ? prev.filter(id => id !== block.id)
          : [...prev, block.id]
      );
    } else {
      setSelectedBlock(block);
      setIsAddModalOpen(true);
    }
  };

  const handleToggleDeleteMode = () => {
    setIsDeleteMode(prev => !prev);
    setPendingDeleteBlockIds([]);
  };

  const handleConfirmDelete = () => {
    pendingDeleteBlockIds.forEach(id => deleteBlock(id));
    setIsDeleteMode(false);
    setPendingDeleteBlockIds([]);
  };

  const handleSaveBlock = (blockData) => {
    if (blockData.id) {
      updateBlock(blockData.id, blockData);
    } else {
      addBlock(blockData);
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-layout">
      {/* Header Bar */}
      {!isFullscreen && (
        <Header
        plans={plans}
        currentPlanId={currentPlanId}
        onSelectPlan={setCurrentPlanId}
        onCreatePlan={createPlan}
        onRenamePlan={renamePlan}
        onDeletePlan={deletePlan}
        blocks={blocks}
        categories={categories}
        showWeekend={settings.showWeekend}
        onToggleWeekend={toggleWeekend}
        onOpenAddModal={handleOpenAddModalForSelection}
        onOpenAnalyticsModal={() => setIsAnalyticsOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenBackupModal={() => setIsBackupOpen(true)}
        user={user}
        firebaseStatus={firebaseStatus}
        isDeleteMode={isDeleteMode}
        onToggleDeleteMode={() => {
          setIsDeleteMode(!isDeleteMode);
          setPendingDeleteBlockIds([]);
        }}
        onConfirmDelete={handleConfirmDelete}
        onToggleFullscreen={toggleFullscreen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      )}

      {/* Floating Exit Button for Full Screen */}
      {isFullscreen && (
        <button 
          className="btn" 
          onClick={toggleFullscreen}
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 9999, 
            boxShadow: 'var(--shadow-hard)', 
            backgroundColor: '#ffffff',
            border: '2px solid var(--border-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <Minimize size={16} /> 전체화면 종료
        </button>
      )}

      {/* Main Grid View */}
      {activeTab === 'personal' ? (
        <main className="main-content-area" ref={mainGridRef}>
          <WeeklyGrid
            blocks={blocks}
            showWeekend={settings.showWeekend}
            gridStartHour={settings.gridStartHour}
            gridEndHour={settings.gridEndHour}
            hourRowHeight={settings.hourRowHeight}
            categories={categories}
            onBlockClick={handleBlockClick}
            onEmptySlotClick={handleEmptySlotClick}
            isDeleteMode={isDeleteMode}
            pendingDeleteBlockIds={pendingDeleteBlockIds}
            selectedEmptySlots={selectedEmptySlots}
          />
        </main>
      ) : (
        <main className="main-content-area" style={{ padding: 0 }}>
          <SharedSpace 
            user={user} 
            plans={plans}
            firebaseStatus={firebaseStatus} 
            onRequireLogin={() => setIsAuthOpen(true)}
            onOpenProfileSettings={() => setIsAuthOpen(true)}
          />
        </main>
      )}

      {/* Digital Business Card Footer */}
      {!isFullscreen && <FooterCard onOpenGuide={() => setIsGuideOpen(true)} />}

      <BlockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onSave={handleSaveBlock}
        onDelete={deleteBlock}
        initialBlock={selectedBlock}
        initialTimeSlots={initialTimeSlots}
      />

      {/* Floating Action Bar for Multi-select */}
      {selectedEmptySlots.length > 0 && !isDeleteMode && (
        <div className="floating-action-bar">
          <span className="selected-count">{selectedEmptySlots.length} {t('selected_slots_count')}</span>
          <button className="btn btn-primary" onClick={handleOpenAddModalForSelection}>
            {t('add_to_selected')}
          </button>
          <button className="btn" onClick={() => setSelectedEmptySlots([])}>
            {t('cancel')}
          </button>
        </div>
      )}

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        firebaseStatus={firebaseStatus}
        onUpdateKeys={updateFirebaseKeys}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onUpdateProfile={async (newName, newStatus) => {
          const success = await updateUserProfile(user, newName, newStatus);
          if (success) {
            // Updated successfully
          } else {
            alert('프로필 저장에 실패했습니다.');
          }
        }}
      />

      {/* Analytics Report Modal */}
      <TimeAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        blocks={blocks}
        categories={categories}
      />

      {/* JSON Backup / Import Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        blocks={blocks}
        onImport={importBlocks}
        currentPlanName={plans.find(p => p.id === currentPlanId)?.name}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      </div>
    </ErrorBoundary>
  );
}
