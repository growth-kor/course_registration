import React, { useMemo } from 'react';
import { Loader, Users } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { WeeklyGrid } from './WeeklyGrid';
import { removeMember, transferOwnership } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

export function ScheduleView() {
  const {
    user, activeRoom, activeMemberId, setActiveMemberId,
    memberScheduleData, loadingSchedule, selectedPlanId,
    loadRooms, setActiveRoom
  } = useSharedSpace();
  const { t } = useLanguage();

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    if (activeRoom.ownerId === user.uid) {
      alert("방장입니다. 먼저 방장을 위임하거나 방을 삭제해 주세요.");
      return;
    }
    if (window.confirm("정말로 이 방에서 나가시겠습니까?")) {
      const success = await removeMember(activeRoom.id, user.uid);
      if (success) {
        setActiveRoom(null);
        loadRooms();
      } else {
        alert("오류가 발생했습니다.");
      }
    }
  };

  const handleKickMember = async (targetId, targetName) => {
    if (!activeRoom || activeRoom.ownerId !== user.uid) return;
    if (window.confirm(`${targetName}님을 강퇴하시겠습니까?`)) {
      const success = await removeMember(activeRoom.id, targetId);
      if (success) {
        if (activeMemberId === targetId) setActiveMemberId(user.uid);
        loadRooms();
      } else {
        alert("오류가 발생했습니다.");
      }
    }
  };

  const handleTransferOwnership = async (targetId, targetName) => {
    if (!activeRoom || activeRoom.ownerId !== user.uid) return;
    if (window.confirm(`정말로 ${targetName}님에게 방장을 위임하시겠습니까? 본인은 일반 멤버가 됩니다.`)) {
      const success = await transferOwnership(activeRoom.id, targetId);
      if (success) {
        loadRooms();
      } else {
        alert("오류가 발생했습니다.");
      }
    }
  };



  const renderMemberSchedule = () => {
    if (activeMemberId !== '__all__' && loadingSchedule) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900', fontSize: '1.2rem' }}>[ 일정 불러오는 중... ]</div>;
    
    let blocksToRender = [];
    
    if (activeMemberId === '__all__') {
      blocksToRender = memberScheduleData?.plans?.[0]?.blocks || [];
    } else {
      if (!memberScheduleData || !memberScheduleData.plans || memberScheduleData.plans.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900' }}>등록된 일정이 없습니다.</div>;
      }

      const currentPlan = memberScheduleData.plans.find(p => p.id === selectedPlanId) || memberScheduleData.plans[0];
      const categories = memberScheduleData.categories || {};
      
      blocksToRender = (currentPlan?.blocks || []).filter(block => {
        const cat = categories[block.category];
        return cat ? cat.isShared !== false : true;
      });
    }

    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <WeeklyGrid
          blocks={blocksToRender}
          showWeekend={true}
          gridStartHour={6}
          gridEndHour={30}
          hourRowHeight={60}
          categories={activeMemberId === '__all__' ? {} : (memberScheduleData?.categories || {})}
          onBlockClick={() => {}}
          onEmptySlotClick={() => {}}
          isDeleteMode={false}
          pendingDeleteBlockIds={[]}
          selectedEmptySlots={[]}
          readOnly={true}
        />
      </div>
    );
  };

  if (!activeRoom) return null;

  // Preview mode: non-member browsing a public room
  if (activeRoom.isPreview) {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
        <Users size={56} style={{ opacity: 0.25 }} />
        <h2 style={{ fontWeight: '900', fontSize: '1.5rem' }}>미리보기 모드</h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 'bold', maxWidth: '400px', lineHeight: 1.6 }}>
          시간표 및 게시판은 방에 참여한 멤버에게만 공개됩니다.<br/>
          방에 참여하면 모든 멤버의 공유 일정을 볼 수 있습니다.
        </p>
        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
          {activeRoom.memberIds?.length || 0}명 참여 중 · 초대 코드: <strong>{activeRoom.inviteCode}</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: '270px', borderRight: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'white', color: 'var(--text-main)' }}>
          <h3 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Users size={18} /> {t('members_count')} ({activeRoom.memberIds?.length || 0})
          </h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <button
            onClick={() => setActiveMemberId('__all__')}
            style={{
              width: '100%',
              padding: '1rem',
              textAlign: 'left',
              background: activeMemberId === '__all__' ? '#f1f5f9' : 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              borderBottom: '2px solid var(--border-main)',
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '1rem',
              transition: 'all 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeMemberId === '__all__' ? 'inset 4px 0 0 var(--text-main)' : 'none'
            }}
          >
            {t('all_members_heatmap')}
          </button>
          {activeRoom.memberIds?.map(mId => {
            const memberInfo = activeRoom.memberDetails?.[mId] || { name: '알 수 없음' };
            const isOwner = activeRoom.ownerId === mId;
            return (
              <div 
                key={mId}
                onClick={() => setActiveMemberId(mId)}
                style={{
                  padding: '0.9rem 1rem',
                  borderBottom: '2px solid var(--border-main)',
                  background: activeMemberId === mId ? 'white' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: activeMemberId === mId ? 'inset 4px 0 0 var(--text-main)' : 'none',
                  transition: 'background-color 0.1s ease',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid var(--border-main)', backgroundColor: isOwner ? 'var(--border-main)' : 'transparent', flexShrink: 0 }} />
                      <span 
                        title={memberInfo.name}
                        style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap', 
                          fontSize: '0.92rem', 
                          fontWeight: '700', 
                          letterSpacing: '-0.01em',
                          color: 'var(--text-main)'
                        }}
                      >
                        {memberInfo.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      {isOwner && (
                        <span style={{ fontSize: '0.68rem', backgroundColor: 'white', color: 'var(--text-main)', border: '1.5px solid var(--border-main)', padding: '0.05rem 0.35rem', fontWeight: 'bold' }}>
                          {t('room_owner')}
                        </span>
                      )}
                      {mId === user.uid && (
                        <span style={{ fontSize: '0.68rem', backgroundColor: 'white', color: 'var(--text-main)', border: '1.5px solid var(--border-main)', padding: '0.05rem 0.35rem', fontWeight: 'bold' }}>
                          {t('room_me')}
                        </span>
                      )}
                    </div>
                  </div>
                  {memberInfo.statusMessage && (
                    <div 
                      title={memberInfo.statusMessage}
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      "{memberInfo.statusMessage}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '1rem', borderTop: '2px solid var(--border-main)' }}>
          <button 
            className="btn btn-sm btn-danger" 
            style={{ width: '100%' }}
            onClick={handleLeaveRoom}
          >
            {t('leave_room')}
          </button>
        </div>
      </div>
      
      {/* Schedule Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', position: 'relative' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', fontSize: '1.5rem' }}>
              {activeMemberId === '__all__' ? '전체 멤버 일정 모아보기' : `${activeRoom.memberDetails?.[activeMemberId]?.name || '알 수 없음'}님의 시간표`}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 'bold' }}>
              {activeMemberId === '__all__' 
                ? '모든 멤버의 공유된 일정이 함께 표시됩니다.'
                : '공유를 허용한 일정만 표시됩니다.'}
            </p>
          </div>
          {activeRoom.ownerId === user.uid && activeMemberId !== '__all__' && activeMemberId !== user.uid && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn btn-sm" onClick={() => handleTransferOwnership(activeMemberId, activeRoom.memberDetails?.[activeMemberId]?.name)}>방장 위임</button>
               <button className="btn btn-sm btn-danger" onClick={() => handleKickMember(activeMemberId, activeRoom.memberDetails?.[activeMemberId]?.name)}>강퇴</button>
            </div>
          )}
        </div>
        {renderMemberSchedule()}
      </div>
    </div>
  );
}
