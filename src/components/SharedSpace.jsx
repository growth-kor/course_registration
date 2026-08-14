import React, { useState } from 'react';
import { Users, Search, Plus, Key, Loader, Globe, Lock, Hash, MessageSquare, Calendar } from 'lucide-react';
import { useSharedSpace, SharedSpaceProvider } from '../context/SharedSpaceContext';
import { ScheduleView } from './ScheduleView';
import { BoardList } from './BoardList';
import { PostWrite } from './PostWrite';
import { PostDetail } from './PostDetail';
import { RoomModals } from './RoomModals';

export function SharedSpace(props) {
  return (
    <SharedSpaceProvider {...props}>
      <SharedSpaceContent />
    </SharedSpaceProvider>
  );
}

function SharedSpaceContent() {
  const {
    user, plans, onRequireLogin, onOpenProfileSettings, firebaseStatus,
    rooms, publicRooms, sidebarTab, setSidebarTab,
    loading, loadingExplore, activeRoom, setActiveRoom,
    roomTab, setRoomTab, boardView, setBoardView, toastMessage,
    setShowCreateModal, setShowJoinModal,
    setSharedPlanIdToJoin
  } = useSharedSpace();

  // Local state for modals/forms
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('일반');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [postComments, setPostComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [newRoomName, setNewRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState('');

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
    <div className="shared-space-container" style={{ 
      display: 'flex', 
      height: '100%', 
      backgroundColor: 'transparent',
      position: 'relative',
      '--color-primary': 'var(--text-main)'
    }}>
      {activeRoom?.themeImageUrl && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${activeRoom.themeImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(1.2) opacity(0.15)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}
      {!activeRoom ? (
        // DASHBOARD VIEW
        <div className="dashboard-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', backgroundColor: 'white', borderBottom: '2px solid var(--border-main)' }}>
            <h1 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={32} /> 공유 시간표 대시보드
            </h1>
          </div>
          
          <div style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderBottom: '2px solid var(--border-main)', paddingBottom: '1.5rem' }}>
              <button 
                className={`btn ${sidebarTab === 'my_rooms' ? 'btn-primary' : ''}`}
                onClick={() => setSidebarTab('my_rooms')}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: '900',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Users size={20} /> 소속된 방
              </button>
              
              <button 
                className={`btn ${sidebarTab === 'explore' ? 'btn-primary' : ''}`}
                onClick={() => setSidebarTab('explore')}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: '900',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Globe size={20} /> 탐색
              </button>

              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setSharedPlanIdToJoin(plans && plans.length > 0 ? plans[0].id : '');
                  setShowCreateModal(true);
                }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: '900', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                <Plus size={20} /> 새 공유방 만들기
              </button>

              <button 
                className="btn" 
                onClick={() => {
                  setSharedPlanIdToJoin(plans && plans.length > 0 ? plans[0].id : '');
                  setShowJoinModal(true);
                }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: '900', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                <Key size={20} /> 코드로 참여하기
              </button>
            </div>

            <div style={{ flex: 1 }}>
              {sidebarTab === 'my_rooms' ? (
                <>
                  <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    내 소속 방 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({rooms.length})</span>
                  </h2>
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)', border: '3px solid var(--border-main)', backgroundColor: 'white', boxShadow: 'var(--shadow-hard-sm)' }}>[ 데이터를 불러오는 중... ]</div>
                  ) : rooms.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '3px dashed var(--border-main)', backgroundColor: 'white' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }}>아직 소속된 공유방이 없습니다.</p>
                      <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>새 방을 만들거나 초대 코드로 참여해 보세요!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {rooms.map(room => (
                        <div 
                          key={room.id}
                          onClick={() => setActiveRoom(room)}
                          className="room-card"
                          style={{
                            backgroundColor: 'white',
                            border: '3px solid var(--border-main)',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            boxShadow: 'var(--shadow-hard-sm)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hard)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-hard-sm)'; }}
                        >
                          {room.isPublic && (
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'white', color: 'var(--text-main)', border: '2px solid var(--border-main)', padding: '0.15rem 0.4rem', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '2px 2px 0 var(--border-main)' }}>
                              <Globe size={13} /> PUBLIC
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', color: 'var(--text-main)', border: '3px solid var(--border-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '1.2rem', flexShrink: 0, backgroundImage: room.themeImageUrl ? `url(${room.themeImageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                              {!room.themeImageUrl && (room.name ? room.name.substring(0,2) : '방')}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: '900', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</h3>
                              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold' }}>{room.memberIds?.length || 0}명 참여 중</p>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5', height: '2.85rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {room.description || '소개글이 없습니다.'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', border: '2px solid var(--border-main)' }} onClick={e => e.stopPropagation()}>
                            <Key size={16} />
                            <span style={{ fontWeight: 'bold', flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px' }}>{room.inviteCode}</span>
                            <button 
                              className="btn btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(room.inviteCode);
                                alert("초대 코드가 복사되었습니다!");
                              }}
                            >
                              복사
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Globe size={24} /> 탐색 (공개 방)
                    </h2>
                    <div style={{ position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="방 이름 또는 소개글 검색..."
                        style={{ paddingLeft: '2.5rem', width: '300px' }}
                      />
                    </div>
                  </div>
                  
                  {loadingExplore ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)', border: '3px solid var(--border-main)', backgroundColor: 'white', boxShadow: 'var(--shadow-hard-sm)' }}>[ 공개방 탐색 중... ]</div>
                  ) : publicRooms.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '3px dashed var(--border-main)', backgroundColor: 'white' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }}>현재 공개된 방이 없습니다.</p>
                      <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>첫 번째 공개방의 주인이 되어보세요!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                      {publicRooms.map(room => (
                        <div key={room.id} style={{
                          backgroundColor: 'white',
                          border: '3px solid var(--border-main)',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: 'var(--shadow-hard-sm)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', color: 'var(--text-main)', border: '3px solid var(--border-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '1.5rem', flexShrink: 0, backgroundImage: room.themeImageUrl ? `url(${room.themeImageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                              {!room.themeImageUrl && (room.name ? room.name.substring(0,2) : '방')}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: '900', fontSize: '1.2rem' }}>{room.name}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} /> {room.memberIds?.length || 0}명</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Hash size={14} /> {room.inviteCode}</span>
                              </div>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5', flex: 1 }}>
                            {room.description || '소개글이 없습니다.'}
                          </p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              if (rooms.find(r => r.id === room.id)) {
                                setActiveRoom(rooms.find(r => r.id === room.id));
                              } else {
                                setJoinCode(room.inviteCode);
                                setSharedPlanIdToJoin(plans && plans.length > 0 ? plans[0].id : '');
                                setShowJoinModal(true);
                              }
                            }}
                            style={{ width: '100%', fontWeight: 'bold' }}
                          >
                            {rooms.find(r => r.id === room.id) ? '방으로 이동' : '참여하기'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE ROOM VIEW
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '2px solid var(--border-main)', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button 
                className="btn" 
                onClick={() => setActiveRoom(null)}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                ← <span style={{ fontWeight: 'bold' }}>대시보드</span>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', color: 'var(--text-main)', border: '2px solid var(--border-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '1rem', backgroundImage: activeRoom.themeImageUrl ? `url(${activeRoom.themeImageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!activeRoom.themeImageUrl && (activeRoom.name ? activeRoom.name.substring(0,2) : '방')}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 0.2rem 0', fontWeight: '900', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {activeRoom.name}
                    {activeRoom.isPublic && <span style={{ backgroundColor: 'white', color: 'var(--text-main)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1.5px solid var(--border-main)', display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontWeight: 'bold' }}><Globe size={12}/>공개</span>}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Hash size={14} /> {activeRoom.inviteCode}</span>
                    <span 
                      style={{ color: 'var(--text-main)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                      onClick={() => { navigator.clipboard.writeText(activeRoom.inviteCode); alert("복사 완료!"); }}
                    >복사하기</span>
                  </div>
                </div>
              </div>
            </div>
              
            <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center' }}>
              <button 
                className="btn"
                onClick={() => setRoomTab('schedule')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontWeight: 'bold', 
                  backgroundColor: roomTab === 'schedule' ? '#f1f5f9' : 'white',
                  boxShadow: roomTab === 'schedule' ? 'none' : 'var(--shadow-hard-sm)', 
                  transform: roomTab === 'schedule' ? 'translate(2px, 2px)' : 'none' 
                }}
              >
                <Calendar size={18} /> 시간표
              </button>
              <button 
                className="btn"
                onClick={() => setRoomTab('board')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontWeight: 'bold', 
                  backgroundColor: roomTab === 'board' ? '#f1f5f9' : 'white',
                  boxShadow: roomTab === 'board' ? 'none' : 'var(--shadow-hard-sm)', 
                  transform: roomTab === 'board' ? 'translate(2px, 2px)' : 'none' 
                }}
              >
                <MessageSquare size={18} /> 게시판
              </button>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
            {roomTab === 'schedule' ? (
              <ScheduleView />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  {boardView === 'list' && (
                    <BoardList 
                      setPostComments={setPostComments} setLoadingComments={setLoadingComments}
                      setNewPostTitle={setNewPostTitle} setNewPostContent={setNewPostContent}
                      setNewPostCategory={setNewPostCategory} setPollOptions={setPollOptions}
                      setBoardView={setBoardView}
                    />
                  )}

                  {boardView === 'write' && (
                    <PostWrite 
                      newPostTitle={newPostTitle} setNewPostTitle={setNewPostTitle}
                      newPostContent={newPostContent} setNewPostContent={setNewPostContent}
                      newPostCategory={newPostCategory} setNewPostCategory={setNewPostCategory}
                      pollOptions={pollOptions} setPollOptions={setPollOptions}
                      isUploadingImage={isUploadingImage} setIsUploadingImage={setIsUploadingImage}
                    />
                  )}

                  {boardView === 'detail' && (
                    <PostDetail 
                      postComments={postComments} setPostComments={setPostComments}
                      newCommentContent={newCommentContent} setNewCommentContent={setNewCommentContent}
                      replyToCommentId={replyToCommentId} setReplyToCommentId={setReplyToCommentId}
                      loadingComments={loadingComments}
                      isUploadingImage={isUploadingImage} setIsUploadingImage={setIsUploadingImage}
                      setNewPostTitle={setNewPostTitle} setNewPostContent={setNewPostContent} setNewPostCategory={setNewPostCategory}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '1rem 2rem',
          border: '3px solid var(--border-main)',
          boxShadow: 'var(--shadow-hard)',
          fontWeight: '900',
          fontSize: '1.1rem',
          zIndex: 9999,
          animation: 'fadeInOut 3s ease-in-out'
        }}>
          {toastMessage}
        </div>
      )}

      <RoomModals 
        newRoomName={newRoomName} setNewRoomName={setNewRoomName}
        isPublic={isPublic} setIsPublic={setIsPublic}
        joinCode={joinCode} setJoinCode={setJoinCode}
      />
    </div>
  );
}
