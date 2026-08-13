import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Key, Loader, Globe, Lock, Hash } from 'lucide-react';
import { fetchRoomsForUser, fetchPublicRooms, createRoom, joinRoomByCode, loadScheduleFromFirestore } from '../firebase/config';
import { WeeklyGrid } from './WeeklyGrid';

export function SharedSpace({ user, firebaseStatus, onRequireLogin }) {
  const [rooms, setRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('my_rooms'); // 'my_rooms' or 'explore'
  const [loading, setLoading] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [memberScheduleData, setMemberScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState('');

  const loadRooms = async () => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const userRooms = await fetchRoomsForUser(user.uid);
    setRooms(userRooms);
    if (userRooms.length > 0 && !activeRoom) {
      setActiveRoom(userRooms[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, [user]);

  useEffect(() => {
    if (sidebarTab === 'explore' && publicRooms.length === 0) {
      async function loadExplore() {
        setLoadingExplore(true);
        const pRooms = await fetchPublicRooms();
        setPublicRooms(pRooms);
        setLoadingExplore(false);
      }
      loadExplore();
    }
  }, [sidebarTab]);

  useEffect(() => {
    if (activeRoom) {
      // default to owner or self
      setActiveMemberId(activeRoom.ownerId);
    }
  }, [activeRoom]);

  useEffect(() => {
    async function loadMemberSchedule() {
      if (!activeMemberId) return;
      setLoadingSchedule(true);
      const data = await loadScheduleFromFirestore(activeMemberId);
      if (data) {
        setMemberScheduleData(data);
      } else {
        setMemberScheduleData({ plans: [], categories: {} });
      }
      setLoadingSchedule(false);
    }
    loadMemberSchedule();
  }, [activeMemberId]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const room = await createRoom(newRoomName, isPublic, user.uid, user.displayName || '이름 없음');
    if (room) {
      alert(`방이 생성되었습니다! 초대 코드: ${room.inviteCode}`);
      setShowCreateModal(false);
      setNewRoomName('');
      loadRooms();
    } else {
      alert('방 생성에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    const result = await joinRoomByCode(joinCode.trim(), user.uid, user.displayName || '이름 없음');
    if (result.success) {
      alert('방에 참여했습니다.');
      setShowJoinModal(false);
      setJoinCode('');
      loadRooms();
    } else {
      alert(result.message);
    }
  };

  const renderMemberSchedule = () => {
    if (loadingSchedule) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}><Loader className="spin" /> 일정 불러오는 중...</div>;
    if (!memberScheduleData || !memberScheduleData.plans || memberScheduleData.plans.length === 0) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>등록된 일정이 없습니다.</div>;
    }

    const currentPlan = memberScheduleData.plans.find(p => p.id === memberScheduleData.currentPlanId) || memberScheduleData.plans[0];
    const categories = memberScheduleData.categories || {};
    
    // Filter blocks that belong to shared categories
    const sharedBlocks = currentPlan.blocks.filter(block => {
      const cat = categories[block.category];
      return cat && cat.isShared !== false; // default to true if not specified
    });

    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <WeeklyGrid
          blocks={sharedBlocks}
          showWeekend={true}
          gridStartHour={6}
          gridEndHour={24}
          hourRowHeight={60}
          categories={categories}
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

  if (!firebaseStatus.isConfigured || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
        <Users size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
        <h2>로그인이 필요합니다</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>공유 시간표(공유 스페이스) 기능은 클라우드 동기화가 필요하여 구글 로그인이 필수입니다.</p>
        <button className="btn btn-primary" onClick={onRequireLogin}>구글 계정으로 로그인</button>
      </div>
    );
  }

  return (
    <div className="shared-space-container" style={{ display: 'flex', height: '100%', backgroundColor: 'transparent' }}>
      {/* Sidebar for Room List */}
      <div className="rooms-sidebar" style={{ width: '300px', borderRight: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ display: 'flex' }}>
          <button 
            onClick={() => setSidebarTab('my_rooms')}
            style={{ 
              flex: 1, 
              padding: '1rem 0.5rem', 
              border: 'none',
              borderRight: '2px solid var(--border-main)',
              borderBottom: sidebarTab === 'my_rooms' ? '4px solid var(--border-main)' : '2px solid var(--border-main)',
              background: sidebarTab === 'my_rooms' ? 'var(--color-primary)' : '#f8fafc',
              color: 'var(--text-main)',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.1s ease'
            }}
          >
            <Users size={16} /> 소속된 방
          </button>
          <button 
            onClick={() => setSidebarTab('explore')}
            style={{ 
              flex: 1, 
              padding: '1rem 0.5rem', 
              border: 'none',
              borderBottom: sidebarTab === 'explore' ? '4px solid var(--border-main)' : '2px solid var(--border-main)',
              background: sidebarTab === 'explore' ? 'var(--color-primary)' : '#f8fafc',
              color: 'var(--text-main)',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.1s ease'
            }}
          >
            <Search size={16} /> 공유방 탐색
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sidebarTab === 'my_rooms' ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-main)', fontWeight: 'bold' }}>불러오는 중...</div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>참여 중인 방이 없습니다.</div>
            ) : (
              rooms.map(room => (
                <button 
                  key={room.id}
                  className="btn"
                  onClick={() => setActiveRoom(room)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    backgroundColor: activeRoom?.id === room.id ? 'var(--color-primary)' : 'white',
                    border: '2px solid var(--border-main)',
                    boxShadow: activeRoom?.id === room.id ? 'var(--shadow-hard-sm)' : 'none',
                    transform: activeRoom?.id === room.id ? 'translate(-2px, -2px)' : 'none',
                    cursor: 'pointer',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%'
                  }}
                >
                  <span>{room.isPublic ? <Globe size={14} color="#166534" /> : <Lock size={14} color="#64748b" />}</span>
                  {room.name}
                </button>
              ))
            )
          ) : (
            loadingExplore ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-main)', fontWeight: 'bold' }}>탐색 중...</div>
            ) : publicRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>공개된 방이 없습니다.</div>
            ) : (
              publicRooms.map(room => {
                const isMember = rooms.some(r => r.id === room.id);
                return (
                  <div 
                    key={room.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: '2px solid var(--border-main)',
                      boxShadow: 'var(--shadow-hard-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900', fontSize: '1.1rem' }}>
                      <Globe size={18} color="var(--border-main)" /> {room.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>멤버: {room.memberIds?.length || 1}명</div>
                    {isMember ? (
                      <button className="btn" disabled style={{ width: '100%', background: '#e2e8f0', color: '#64748b' }}>이미 참여 중</button>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={async () => {
                          const result = await joinRoomByCode(room.inviteCode, user.uid, user.displayName || '이름 없음');
                          if (result.success) {
                            alert('방에 참여했습니다.');
                            setSidebarTab('my_rooms');
                            loadRooms();
                          } else {
                            alert(result.message);
                          }
                        }}
                      >
                        입장하기
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>

        <div style={{ padding: '1rem', borderTop: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'white' }}>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={16} /> 새 방 만들기
          </button>
          <button className="btn" onClick={() => setShowJoinModal(true)} style={{ width: '100%', justifyContent: 'center' }}>
            <Key size={16} /> 코드로 입장
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="shared-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
        {!activeRoom ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900', fontSize: '1.2rem', backgroundColor: 'var(--bg-main)' }}>
            방을 선택해 주세요
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="room-header" style={{ padding: '1.5rem 2rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900' }}>
                  {activeRoom.isPublic ? <Globe size={24} color="var(--border-main)" /> : <Lock size={24} color="var(--border-main)" />}
                  {activeRoom.name}
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  초대 코드: <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--color-primary)', padding: '0.2rem 0.5rem', border: '2px solid var(--border-main)', borderRadius: '4px', boxShadow: 'var(--shadow-hard-sm)', userSelect: 'all' }}>{activeRoom.inviteCode}</span>
                </div>
              </div>
              
              <div className="member-selector" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
                <span style={{ fontWeight: '900', marginRight: '0.5rem' }}>멤버 일정:</span>
                {activeRoom.memberIds.map(mId => (
                  <button 
                    key={mId}
                    className="btn"
                    onClick={() => setActiveMemberId(mId)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid var(--border-main)',
                      backgroundColor: activeMemberId === mId ? 'var(--color-primary)' : 'white',
                      fontWeight: '900',
                      boxShadow: activeMemberId === mId ? 'var(--shadow-hard-sm)' : 'none',
                      transform: activeMemberId === mId ? 'translate(-2px, -2px)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {activeRoom.memberDetails[mId]?.name || '알 수 없음'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Schedule Viewer */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
              {renderMemberSchedule()}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>새 공유방 만들기</h2>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">방 이름</label>
              <input type="text" className="input-field" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="예: 2024 스터디 그룹" />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                공개방 (누구나 참여 가능)
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowCreateModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateRoom} disabled={!newRoomName.trim()}>만들기</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>초대 코드로 입장</h2>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">초대 코드</label>
              <input type="text" className="input-field" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="6자리 영문/숫자" style={{ textTransform: 'uppercase' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowJoinModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleJoinRoom} disabled={!joinCode.trim()}>입장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
