import React, { useMemo } from 'react';
import { Loader, Users } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { WeeklyGrid } from './WeeklyGrid';
import { removeMember, transferOwnership } from '../firebase/config';

export function ScheduleView() {
  const {
    user, activeRoom, activeMemberId, setActiveMemberId,
    memberScheduleData, loadingSchedule, selectedPlanId,
    loadRooms, setActiveRoom
  } = useSharedSpace();

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

  // Overlay all members' shared schedules
  const generateHeatmap = useMemo(() => {
    if (activeMemberId !== '__all__' || !activeRoom) return [];

    const allBlocks = [];
    (activeRoom.memberIds || []).forEach(mId => {
      const memberInfo = activeRoom.memberDetails?.[mId];
      if (!memberInfo) return;
      
      const memberPlan = memberInfo.schedule?.plans?.find(p => p.id === memberInfo.sharedPlanId) || memberInfo.schedule?.plans?.[0];
      const memberCategories = memberInfo.schedule?.categories || {};
      
      if (!memberPlan) return;

      (memberPlan.blocks || []).forEach(block => {
        const cat = memberCategories[block.category];
        if (cat && cat.isShared === false) return; // skip private blocks

        (block.timeSlots || []).forEach(ts => {
          allBlocks.push({
            id: `hm_${mId}_${block.id}_${ts.id}`,
            title: `[${memberInfo.name}] ${block.title}`,
            color: '#ffffff',
            timeSlots: [ts],
            category: block.category,
            location: block.location,
            memo: block.memo,
            isHeatmap: false
          });
        });
      });
    });

    return allBlocks;
  }, [activeMemberId, activeRoom]);

  const renderMemberSchedule = () => {
    if (activeMemberId !== '__all__' && loadingSchedule) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900', fontSize: '1.2rem' }}>[ 일정 불러오는 중... ]</div>;
    
    let blocksToRender = [];
    
    if (activeMemberId === '__all__') {
      blocksToRender = generateHeatmap;
    } else {
      if (!memberScheduleData || !memberScheduleData.plans || memberScheduleData.plans.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900' }}>등록된 일정이 없습니다.</div>;
      }

      const currentPlan = memberScheduleData.plans.find(p => p.id === selectedPlanId) || memberScheduleData.plans[0];
      const categories = memberScheduleData.categories || {};
      
      blocksToRender = (currentPlan?.blocks || []).filter(block => {
        const cat = categories[block.category];
        return cat && cat.isShared !== false; // default to true if not specified
      });
    }

    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <WeeklyGrid
          blocks={blocksToRender}
          showWeekend={true}
          gridStartHour={6}
          gridEndHour={24}
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

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: '250px', borderRight: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ padding: '1rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'white', color: 'var(--text-main)' }}>
          <h3 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Users size={18} /> 참여 멤버 ({activeRoom.memberIds?.length || 0})
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
            전체 멤버 겹쳐보기
          </button>
          {activeRoom.memberIds?.map(mId => {
            const memberInfo = activeRoom.memberDetails?.[mId] || { name: '알 수 없음' };
            const isOwner = activeRoom.ownerId === mId;
            return (
              <div 
                key={mId}
                onClick={() => setActiveMemberId(mId)}
                style={{
                  padding: '1rem',
                  borderBottom: '2px solid var(--border-main)',
                  background: activeMemberId === mId ? 'white' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: activeMemberId === mId ? 'inset 4px 0 0 var(--text-main)' : 'none',
                  transition: 'background-color 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid var(--border-main)', backgroundColor: isOwner ? 'var(--border-main)' : 'transparent' }} />
                  {memberInfo.name}
                  {isOwner && <span style={{ fontSize: '0.7rem', backgroundColor: 'white', color: 'var(--text-main)', border: '1.5px solid var(--border-main)', padding: '0.1rem 0.35rem', fontWeight: 'bold' }}>방장</span>}
                  {mId === user.uid && <span style={{ fontSize: '0.7rem', backgroundColor: 'white', color: 'var(--text-main)', border: '1.5px solid var(--border-main)', padding: '0.1rem 0.35rem', fontWeight: 'bold' }}>나</span>}
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
            방 나가기
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
