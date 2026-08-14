import React from 'react';
import { Users, Search, Plus, Key, Loader, Globe, Lock, Hash, Trash2 } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { createRoom, joinRoomByCode, updateMemberSharedPlan, removeMember, transferOwnership, deleteRoom, updateRoomInfo } from '../firebase/config';

export function RoomModals({
  newRoomName, setNewRoomName,
  isPublic, setIsPublic,
  joinCode, setJoinCode
}) {
  const {
    user, activeRoom, setActiveRoom, rooms, setRooms, loadRooms,
    showCreateModal, setShowCreateModal,
    showJoinModal, setShowJoinModal,
    showPlanChangeModal, setShowPlanChangeModal,
    showRoomSettingsModal, setShowRoomSettingsModal,
    sharedPlanIdToJoin, setSharedPlanIdToJoin,
    plans, activeMemberId, setActiveMemberId,
    selectedPlanId, setSelectedPlanId
  } = useSharedSpace();

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

  const handleUpdateSharedPlan = async (newPlanId) => {
    setSelectedPlanId(newPlanId);
    if (!activeRoom) return;
    const success = await updateMemberSharedPlan(activeRoom.id, user.uid, newPlanId);
    if (success) {
      loadRooms(); // Refresh to update memberDetails locally
    }
  };

  return (
    <>
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>새로운 공유 방 만들기</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>방 이름</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  placeholder="예: 멋쟁이 사자처럼 11기"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>공개 설정</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} />
                    <Globe size={18} /> 공개 (탐색에서 보임)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} />
                    <Lock size={18} /> 비공개 (코드 입력으로만 참여)
                  </label>
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>공유할 내 시간표 선택</label>
                <select 
                  className="input-field"
                  value={sharedPlanIdToJoin}
                  onChange={e => setSharedPlanIdToJoin(e.target.value)}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>이 방의 멤버들과 공유할 내 시간표를 선택합니다.</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowCreateModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateRoom} disabled={!newRoomName.trim()}>만들기</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>참여 코드로 방 입장하기</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>참여 코드</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="6자리 참여 코드를 입력하세요"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>공유할 내 시간표 선택</label>
                <select 
                  className="input-field"
                  value={sharedPlanIdToJoin}
                  onChange={e => setSharedPlanIdToJoin(e.target.value)}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowJoinModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleJoinRoom} disabled={!joinCode.trim()}>입장하기</button>
            </div>
          </div>
        </div>
      )}

      {showPlanChangeModal && (
        <div className="modal-overlay" onClick={() => setShowPlanChangeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>공유 시간표 변경</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>새로 공유할 시간표 선택</label>
                <select 
                  className="input-field"
                  value={selectedPlanId}
                  onChange={e => handleUpdateSharedPlan(e.target.value)}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>선택 시 즉시 저장되며 다른 멤버들에게 이 시간표가 보여집니다.</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => setShowPlanChangeModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {showRoomSettingsModal && activeRoom && (
        <div className="modal-overlay" onClick={() => setShowRoomSettingsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>⚙️ 방 설정 변경</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>방 이름</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={activeRoom.name}
                  id="editRoomName"
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>방 소개글</label>
                <textarea 
                  className="input-field" 
                  defaultValue={activeRoom.description || ''}
                  id="editRoomDesc"
                  placeholder="우리 방을 소개하는 짧은 글을 적어주세요!"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>방 테마 색상 (HEX 코드)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    id="editRoomThemeColorPicker"
                    defaultValue={activeRoom.themeColor || '#fbbf24'}
                    style={{ width: '50px', height: '42px', padding: '0', cursor: 'pointer', border: '2px solid var(--border-main)' }}
                    onChange={e => document.getElementById('editRoomThemeColor').value = e.target.value}
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    defaultValue={activeRoom.themeColor || '#fbbf24'}
                    id="editRoomThemeColor"
                    placeholder="예: #fbbf24"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>방 배경 이미지 URL</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={activeRoom.themeImageUrl || ''}
                  id="editRoomThemeImage"
                  placeholder="이미지 URL 주소를 입력하세요 (선택)"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>방 삭제</span>
                <button className="btn btn-sm btn-danger" onClick={() => {
                  setShowRoomSettingsModal(false);
                  handleDeleteRoom();
                }}>
                  <Trash2 size={16}/> 이 방 완전히 삭제하기
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setShowRoomSettingsModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={async () => {
                const newName = document.getElementById('editRoomName').value.trim();
                const newDesc = document.getElementById('editRoomDesc').value.trim();
                const newThemeColor = document.getElementById('editRoomThemeColor').value.trim();
                const newThemeImage = document.getElementById('editRoomThemeImage').value.trim();
                
                if (newName) {
                  const updates = { 
                    name: newName, 
                    description: newDesc,
                    themeColor: newThemeColor,
                    themeImageUrl: newThemeImage
                  };
                  const success = await updateRoomInfo(activeRoom.id, updates);
                  if (success) {
                    setActiveRoom(prev => ({...prev, ...updates}));
                    setRooms(prev => prev.map(r => r.id === activeRoom.id ? {...r, ...updates} : r));
                  }
                }
                setShowRoomSettingsModal(false);
              }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
