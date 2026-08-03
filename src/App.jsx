import React, { useState } from 'react';
import { useSchedule } from './hooks/useSchedule';
import { Header } from './components/Header';
import { WeeklyGrid } from './components/WeeklyGrid';
import { BlockModal } from './components/BlockModal';
import { AuthModal } from './components/AuthModal';
import { TimeAnalyticsModal } from './components/TimeAnalyticsModal';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const {
    blocks,
    settings,
    user,
    firebaseStatus,
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

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [defaultSlot, setDefaultSlot] = useState({ day: 1, startTime: '09:00' });

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Handlers
  const handleOpenAddModal = (day = 1, startTime = '09:00') => {
    setSelectedBlock(null);
    setDefaultSlot({ day, startTime });
    setIsAddModalOpen(true);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    setIsAddModalOpen(true);
  };

  const handleSaveBlock = (blockData) => {
    if (blockData.id) {
      updateBlock(blockData.id, blockData);
    } else {
      addBlock(blockData);
    }
  };

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <Header
        blocks={blocks}
        showWeekend={settings.showWeekend}
        onToggleWeekend={toggleWeekend}
        onOpenAddModal={() => handleOpenAddModal(1, '09:00')}
        onOpenAnalyticsModal={() => setIsAnalyticsOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenBackupModal={() => setIsBackupOpen(true)}
        onResetSample={resetToSample}
        user={user}
        firebaseStatus={firebaseStatus}
      />

      {/* Main Grid View */}
      <main className="main-content-area">
        <WeeklyGrid
          blocks={blocks}
          showWeekend={settings.showWeekend}
          gridStartHour={settings.gridStartHour}
          gridEndHour={settings.gridEndHour}
          hourRowHeight={settings.hourRowHeight}
          onBlockClick={handleBlockClick}
          onEmptySlotClick={handleOpenAddModal}
        />
      </main>

      {/* Footer Info Banner */}
      <footer className="footer-bar">
        <div className="footer-info">
          <span>🗓️ 1시간 단위 그리드 UI | 10분 단위 정밀 기입 지원</span>
          <span>⚡ Brutalist Practical Routine Planner</span>
        </div>
      </footer>

      {/* Block Create / Edit Modal */}
      <BlockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={deleteBlock}
        initialBlock={selectedBlock}
        defaultDay={defaultSlot.day}
        defaultStartTime={defaultSlot.startTime}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        firebaseStatus={firebaseStatus}
        onUpdateKeys={updateFirebaseKeys}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Analytics Report Modal */}
      <TimeAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        blocks={blocks}
      />

      {/* JSON Backup / Import Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        blocks={blocks}
        onImport={importBlocks}
      />
    </div>
  );
}
