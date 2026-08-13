import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Key, Loader, Globe, Lock, Hash, MessageSquare, Trash2, Send, Calendar } from 'lucide-react';
import { fetchRoomsForUser, fetchPublicRooms, createRoom, joinRoomByCode, loadScheduleFromFirestore, updateMemberSharedPlan, removeMember, transferOwnership, deleteRoom, fetchPosts, addPost, deletePost } from '../firebase/config';
import { WeeklyGrid } from './WeeklyGrid';

export function SharedSpace({ user, plans, firebaseStatus, onRequireLogin, onOpenProfileSettings }) {
  const [rooms, setRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('my_rooms'); // 'my_rooms' or 'explore'
  const [loading, setLoading] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [memberScheduleData, setMemberScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [roomTab, setRoomTab] = useState('schedule'); // 'schedule' or 'board'
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [sharedPlanIdToJoin, setSharedPlanIdToJoin] = useState('');

  useEffect(() => {
    if (plans && plans.length > 0 && !sharedPlanIdToJoin) {
      setSharedPlanIdToJoin(plans[0].id);
    }
  }, [plans]);

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

  const [selectedPlanId, setSelectedPlanId] = useState(''); // NEW

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
        const memberSharedPlanId = activeRoom?.memberDetails[activeMemberId]?.sharedPlanId;
        const defaultPlanId = data.plans && data.plans.length > 0 ? data.plans[0].id : '';
        
        if (activeMemberId === user.uid) {
           setSelectedPlanId(memberSharedPlanId || defaultPlanId);
        } else {
           const hasSharedPlan = data.plans?.some(p => p.id === memberSharedPlanId);
           setSelectedPlanId(hasSharedPlan ? memberSharedPlanId : defaultPlanId);
        }
      } else {
        setMemberScheduleData({ plans: [], categories: {} });
        setSelectedPlanId('');
      }
      setLoadingSchedule(false);
    }
    loadMemberSchedule();
  }, [activeMemberId, activeRoom, user.uid]);

  const loadPosts = async () => {
    if (!activeRoom) return;
    setLoadingPosts(true);
    const p = await fetchPosts(activeRoom.id);
    setPosts(p);
    setLoadingPosts(false);
  };

  useEffect(() => {
    if (activeRoom && roomTab === 'board') {
      loadPosts();
    }
  }, [activeRoom, roomTab]);

  const handleAddPost = async () => {
    if (!newPostContent.trim() || !activeRoom) return;
    const post = await addPost(activeRoom.id, user.uid, user.displayName || '이름 없음', newPostContent.trim());
    if (post) {
      setNewPostContent('');
      loadPosts();
    } else {
      alert("글 작성에 실패했습니다.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!activeRoom) return;
    if (window.confirm("이 글을 삭제하시겠습니까?")) {
      const success = await deletePost(activeRoom.id, postId);
      if (success) {
        loadPosts();
      } else {
        alert("글 삭제에 실패했습니다.");
      }
    }
  };

  const handleUpdateSharedPlan = async (newPlanId) => {
    setSelectedPlanId(newPlanId);
    if (!activeRoom) return;
    const success = await updateMemberSharedPlan(activeRoom.id, user.uid, newPlanId);
    if (success) {
      loadRooms(); // Refresh to update memberDetails locally
    }
  };

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

  const handleDeleteRoom = async () => {
    if (!activeRoom || activeRoom.ownerId !== user.uid) return;
    if (window.confirm("정말로 이 방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      const success = await deleteRoom(activeRoom.id);
      if (success) {
        setActiveRoom(null);
        loadRooms();
      } else {
        alert("오류가 발생했습니다.");
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const room = await createRoom(user.uid, user.displayName || '이름 없음', newRoomName, isPublic, sharedPlanIdToJoin);
    if (room) {
      alert(`방이 생성되었습니다! 초대 코드: ${room.inviteCode}`);
      setShowCreateModal(false);
      setNewRoomName('');
      loadRooms();
    } else {
      alert('방 생성에 실패했습니다. Firebase 권한 설정을 확인해주세요.');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    const result = await joinRoomByCode(joinCode.trim(), user.uid, user.displayName || '이름 없음', sharedPlanIdToJoin);
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
    if (loadingSchedule) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900' }}><Loader className="spin" style={{ marginRight: '0.5rem' }} /> 일정 불러오는 중...</div>;
    if (!memberScheduleData || !memberScheduleData.plans || memberScheduleData.plans.length === 0) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)', fontWeight: '900' }}>등록된 일정이 없습니다.</div>;
    }

    const currentPlan = memberScheduleData.plans.find(p => p.id === selectedPlanId) || memberScheduleData.plans[0];
    const categories = memberScheduleData.categories || {};
    
    // transform member's blocks 
    const sharedBlocks = (currentPlan?.blocks || []).filter(block => {
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
      {!activeRoom ? (
        // DASHBOARD VIEW
        <div className="dashboard-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', backgroundColor: 'white', borderBottom: '2px solid var(--border-main)' }}>
            <h1 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={32} /> 공유 시간표 대시보드
            </h1>
            {onOpenProfileSettings && (
              <button 
                className="btn btn-primary" 
                onClick={onOpenProfileSettings}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                내 프로필 설정
              </button>
            )}
          </div>
          
          <div style={{ padding: '2rem 3rem', display: 'flex', gap: '2rem', flex: 1, overflowY: 'auto' }}>
            {/* Left Column: Navigation Tabs & Create/Join */}
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                  className={`btn ${sidebarTab === 'my_rooms' ? 'btn-primary' : ''}`}
                  onClick={() => setSidebarTab('my_rooms')}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    border: '2px solid var(--border-main)',
                    background: sidebarTab === 'my_rooms' ? 'var(--color-primary)' : 'white',
                    color: 'var(--text-main)',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: sidebarTab === 'my_rooms' ? 'none' : 'var(--shadow-hard)',
                    transform: sidebarTab === 'my_rooms' ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s ease',
                    textAlign: 'left'
                  }}
                >
                  <Users size={20} /> 소속된 방
                </button>
                <button 
                  className={`btn ${sidebarTab === 'explore' ? 'btn-primary' : ''}`}
                  onClick={() => setSidebarTab('explore')}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    border: '2px solid var(--border-main)',
                    background: sidebarTab === 'explore' ? 'var(--color-primary)' : 'white',
                    color: 'var(--text-main)',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: sidebarTab === 'explore' ? 'none' : 'var(--shadow-hard)',
                    transform: sidebarTab === 'explore' ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s ease',
                    textAlign: 'left'
                  }}
                >
                  <Search size={20} /> 공유방 탐색
                </button>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'white', border: '2px solid var(--border-main)', boxShadow: 'var(--shadow-hard)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                  <Plus size={18} /> 새 방 만들기
                </button>
                <button className="btn" onClick={() => setShowJoinModal(true)} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                  <Key size={18} /> 코드로 입장
                </button>
              </div>
            </div>

            {/* Right Column: Grid of Rooms */}
            <div style={{ flex: 1 }}>
              {sidebarTab === 'my_rooms' ? (
                loading ? (
                  <div style={{ padding: '3rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>방 목록을 불러오는 중...</div>
                ) : rooms.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', border: '2px dashed var(--border-main)' }}>
                    <Users size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>참여 중인 공유방이 없습니다.</h2>
                    <p style={{ color: '#64748b' }}>새로운 방을 만들거나 초대 코드로 입장해 보세요!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {rooms.map(room => {
                      const myDetails = room.memberDetails[user.uid] || {};
                      const mySharedPlanName = plans?.find(p => p.id === myDetails.sharedPlanId)?.name || '기본 플랜';
                      return (
                        <div 
                          key={room.id}
                          style={{
                            padding: '1.5rem',
                            backgroundColor: 'white',
                            border: '2px solid var(--border-main)',
                            boxShadow: 'var(--shadow-hard-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.1s'
                          }}
                          onClick={() => setActiveRoom(room)}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-4px, -4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900', fontSize: '1.2rem' }}>
                            {room.isPublic ? <Globe size={20} color="#166534" /> : <Lock size={20} color="#64748b" />}
                            {room.name}
                          </div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 'bold' }}>멤버: {room.memberIds?.length || 1}명</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            내 공유 플랜: <strong>{mySharedPlanName}</strong>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              ) : (
                loadingExplore ? (
                  <div style={{ padding: '3rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>탐색 중...</div>
                ) : publicRooms.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', border: '2px dashed var(--border-main)' }}>
                    <Search size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>공개된 방이 없습니다.</h2>
                    <p style={{ color: '#64748b' }}>가장 먼저 공개방을 만들어보세요!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {publicRooms.map(room => {
                      const isMember = rooms.some(r => r.id === room.id);
                      return (
                        <div 
                          key={room.id}
                          style={{
                            padding: '1.5rem',
                            backgroundColor: 'white',
                            border: '2px solid var(--border-main)',
                            boxShadow: 'var(--shadow-hard-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900', fontSize: '1.2rem' }}>
                            <Globe size={20} color="var(--border-main)" /> {room.name}
                          </div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 'bold' }}>멤버: {room.memberIds?.length || 1}명</div>
                          {isMember ? (
                            <button className="btn" disabled style={{ width: '100%', background: '#e2e8f0', color: '#64748b', marginTop: 'auto' }}>이미 참여 중</button>
                          ) : (
                            <button 
                              className="btn btn-primary" 
                              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                              onClick={() => {
                                setJoinCode(room.inviteCode);
                                setShowJoinModal(true);
                              }}
                            >
                              참여하기
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        // ROOM VIEWER VIEW (2-Pane)
        <>
          {/* 1. Sidebar for Member List */}
          <div className="members-sidebar" style={{ width: '280px', borderRight: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{ padding: '1rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'var(--bg-main)' }}>
              <button 
                className="btn" 
                onClick={() => setActiveRoom(null)} 
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                ← 대시보드로 돌아가기
              </button>
            </div>
            <div style={{ padding: '1.25rem 1rem', borderBottom: '2px solid var(--border-main)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white' }}>
              <Users size={18} /> 멤버 목록 ({activeRoom.memberIds?.length || 0}명)
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-main)' }}>
              {activeRoom.memberIds.map(mId => {
                const isMe = mId === user.uid;
                const isOwner = mId === activeRoom.ownerId;
                const amIOwner = activeRoom.ownerId === user.uid;
                return (
                <div key={mId} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    className="btn"
                    onClick={() => setActiveMemberId(mId)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '2px solid var(--border-main)',
                      backgroundColor: activeMemberId === mId ? 'var(--color-primary)' : 'white',
                      fontWeight: '900',
                      boxShadow: activeMemberId === mId ? 'none' : 'var(--shadow-hard-sm)',
                      transform: activeMemberId === mId ? 'none' : 'translate(-2px, -2px)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {activeRoom.memberDetails[mId]?.name || '알 수 없음'}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem', fontSize: '0.8rem' }}>
                      {isOwner && <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>(방장)</span>}
                      {isMe && <span style={{ color: '#64748b' }}>(나)</span>}
                    </div>
                  </button>
                  {amIOwner && !isMe && (
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'white' }} onClick={() => handleTransferOwnership(mId, activeRoom.memberDetails[mId]?.name)}>위임</button>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'white' }} onClick={() => handleKickMember(mId, activeRoom.memberDetails[mId]?.name)}>강퇴</button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>

          {/* 2. Main Content Area */}
          <div className="shared-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="room-header" style={{ padding: '1.25rem 2rem', borderBottom: '2px solid var(--border-main)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900' }}>
                    {activeRoom.isPublic ? <Globe size={24} color="var(--border-main)" /> : <Lock size={24} color="var(--border-main)" />}
                    {activeRoom.name}
                    {activeRoom.ownerId === user.uid && <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>(방장)</span>}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    초대 코드: <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--color-primary)', padding: '0.2rem 0.5rem', border: '2px solid var(--border-main)', borderRadius: '4px', boxShadow: 'var(--shadow-hard-sm)', userSelect: 'all' }}>{activeRoom.inviteCode}</span>
                    {activeRoom.ownerId === user.uid ? (
                      <button className="btn" style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'white' }} onClick={handleDeleteRoom}>방 삭제</button>
                    ) : (
                      <button className="btn" style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#f1f5f9' }} onClick={handleLeaveRoom}>방 나가기</button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                  <button 
                    className={`btn ${roomTab === 'schedule' ? 'btn-primary' : ''}`}
                    onClick={() => setRoomTab('schedule')}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: roomTab === 'schedule' ? 'none' : 'var(--shadow-hard-sm)', transform: roomTab === 'schedule' ? 'translate(2px, 2px)' : 'none' }}
                  >
                    <Calendar size={18} /> 시간표
                  </button>
                  <button 
                    className={`btn ${roomTab === 'board' ? 'btn-primary' : ''}`}
                    onClick={() => setRoomTab('board')}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: roomTab === 'board' ? 'none' : 'var(--shadow-hard-sm)', transform: roomTab === 'board' ? 'translate(2px, 2px)' : 'none' }}
                  >
                    <MessageSquare size={18} /> 게시판
                  </button>
                </div>

                {roomTab === 'schedule' ? (
                  <div className="member-viewer-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>
                    {activeRoom.memberDetails[activeMemberId]?.name || '알 수 없음'}님의 스케줄
                  </span>
                  
                  {memberScheduleData && memberScheduleData.plans && memberScheduleData.plans.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {activeMemberId === user.uid ? (
                        <button 
                          className="btn"
                          onClick={() => setShowPlanChangeModal(true)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', fontWeight: 'bold' }}
                        >
                          공개 시간표 변경 ▾
                        </button>
                      ) : (
                        <div style={{ padding: '0.5rem 1rem', border: '2px solid var(--border-main)', backgroundColor: 'var(--bg-main)', fontWeight: 'bold' }}>
                          {memberScheduleData.plans.find(p => p.id === (activeRoom.memberDetails[activeMemberId]?.sharedPlanId || memberScheduleData.plans[0].id))?.name || '시간표'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                ) : (
                  <div style={{ flex: 1 }}></div>
                )}
              </div>
              
              {/* Main Content Viewer */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
                {roomTab === 'schedule' ? (
                  renderMemberSchedule()
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2rem' }}>
                    {/* Board UI */}
                    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '2px solid var(--border-main)', boxShadow: 'var(--shadow-hard)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} /> 새 글 작성</h3>
                        <textarea 
                          className="input-field" 
                          placeholder="방 멤버들과 공유할 내용을 입력하세요..." 
                          value={newPostContent}
                          onChange={e => setNewPostContent(e.target.value)}
                          style={{ minHeight: '100px', resize: 'vertical', width: '100%', padding: '1rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                          <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddPost} disabled={!newPostContent.trim()}>
                            <Send size={16} /> 등록하기
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loadingPosts ? (
                          <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 'bold' }}>불러오는 중...</div>
                        ) : posts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', border: '2px solid var(--border-main)', color: 'var(--text-main)', fontWeight: 'bold' }}>
                            아직 작성된 글이 없습니다. 첫 글을 남겨보세요!
                          </div>
                        ) : (
                          posts.map(post => (
                            <div key={post.id} style={{ backgroundColor: 'white', padding: '1.5rem', border: '2px solid var(--border-main)', boxShadow: 'var(--shadow-hard-sm)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                  <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-main)' }}>{post.authorName}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(post.createdAt).toLocaleString()}</div>
                                </div>
                                {(activeRoom.ownerId === user.uid || post.authorId === user.uid) && (
                                  <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => handleDeletePost(post.id)}>
                                    <Trash2 size={14} /> 삭제
                                  </button>
                                )}
                              </div>
                              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{post.content}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}


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
              <label className="form-label">공유할 내 플랜(시간표)</label>
              <select 
                className="input-field"
                value={sharedPlanIdToJoin}
                onChange={e => setSharedPlanIdToJoin(e.target.value)}
              >
                {plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                공개방 (누구나 탐색 및 참여 가능)
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowCreateModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateRoom} disabled={!newRoomName.trim() || !sharedPlanIdToJoin}>만들기</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>방 참여하기</h2>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">초대 코드</label>
              <input type="text" className="input-field" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="6자리 영문/숫자" style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">공유할 내 플랜(시간표)</label>
              <select 
                className="input-field"
                value={sharedPlanIdToJoin}
                onChange={e => setSharedPlanIdToJoin(e.target.value)}
              >
                {plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowJoinModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleJoinRoom} disabled={!joinCode.trim() || !sharedPlanIdToJoin}>입장</button>
            </div>
          </div>
        </div>
      )}

      {showPlanChangeModal && (
        <div className="modal-overlay" onClick={() => setShowPlanChangeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>공개할 시간표 선택</h2>
            </div>
            <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              이 방({activeRoom?.name})의 사람들에게 보여줄 내 시간표를 선택하세요.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {memberScheduleData?.plans?.map(p => (
                <label 
                  key={p.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '1rem', 
                    border: '2px solid var(--border-main)', 
                    backgroundColor: selectedPlanId === p.id ? 'var(--color-primary)' : 'white',
                    cursor: 'pointer',
                    boxShadow: selectedPlanId === p.id ? 'none' : 'var(--shadow-hard-sm)',
                    transform: selectedPlanId === p.id ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s ease',
                    fontWeight: 'bold'
                  }}
                  onClick={() => {
                    handleUpdateSharedPlan(p.id);
                    setShowPlanChangeModal(false);
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', 
                    border: '2px solid var(--border-main)', 
                    borderRadius: '50%', 
                    backgroundColor: selectedPlanId === p.id ? 'black' : 'white',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}>
                    {selectedPlanId === p.id && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }} />}
                  </div>
                  {p.name}
                  {selectedPlanId === p.id && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>(현재 공개 중)</span>}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowPlanChangeModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
