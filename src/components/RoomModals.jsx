import React, { useState } from 'react';
import { Users, Search, Plus, Key, Loader, Globe, Lock, Hash, Trash2, Upload, X } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { useLanguage } from '../context/LanguageContext';
import { createRoom, joinRoomByCode, updateMemberSharedPlan, removeMember, transferOwnership, deleteRoom, updateRoomInfo, uploadRoomImage } from '../firebase/config';

// Compress image using canvas to reduce Firebase Storage usage
async function compressImage(file, maxWidthPx = 400, maxKB = 150) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      // Try quality 0.8 -> 0.6 -> 0.4 until under maxKB
      let quality = 0.8;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length * 0.75 > maxKB * 1024 && quality > 0.3) {
        quality -= 0.15;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      // Convert to Blob
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    img.src = url;
  });
}

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
  const { t } = useLanguage();

  const [settingsTab, setSettingsTab] = useState('info'); // 'info' | 'members'

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

  const handleKickMember = async (targetId, targetName) => {
    if (!activeRoom || activeRoom.ownerId !== user.uid) return;
    if (window.confirm(`${targetName}님을 이 방에서 강퇴하시겠습니까?`)) {
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
    if (window.confirm(`정말로 ${targetName}님에게 방장을 위임하시겠습니까? 위임 후 본인은 일반 멤버가 됩니다.`)) {
      const success = await transferOwnership(activeRoom.id, targetId);
      if (success) {
        loadRooms();
        setShowRoomSettingsModal(false);
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
      loadRooms();
    }
  };

  const [settingsName, setSettingsName] = useState('');
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsImageFile, setSettingsImageFile] = useState(null);
  const [settingsImagePreview, setSettingsImagePreview] = useState(null);
  const [settingsImageUrl, setSettingsImageUrl] = useState('');
  const [settingsAllowGuestView, setSettingsAllowGuestView] = useState(true);
  const [isUploadingRoomImage, setIsUploadingRoomImage] = useState(false);

  // Initialize form state when modal opens
  React.useEffect(() => {
    if (showRoomSettingsModal && activeRoom) {
      setSettingsName(activeRoom.name || '');
      setSettingsDesc(activeRoom.description || '');
      setSettingsImageFile(null);
      setSettingsImageUrl(activeRoom.themeImageUrl || '');
      setSettingsImagePreview(activeRoom.themeImageUrl || null);
      setSettingsAllowGuestView(activeRoom.allowGuestView !== false);
    }
  }, [showRoomSettingsModal, activeRoom?.id]);

  const handleRoomImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSettingsImageFile(file);
    setSettingsImageUrl(''); // clear URL when file is chosen
    const previewUrl = URL.createObjectURL(file);
    setSettingsImagePreview(previewUrl);
  };

  const handleSaveRoomSettings = async () => {
    if (!settingsName.trim()) return;
    setIsUploadingRoomImage(true);
    let themeImageUrl = settingsImageUrl.trim() || activeRoom.themeImageUrl || '';
    
    if (settingsImageFile) {
      try {
        const compressed = await compressImage(settingsImageFile, 400, 150);
        const uploadedUrl = await uploadRoomImage(activeRoom.id, compressed);
        if (uploadedUrl) themeImageUrl = uploadedUrl;
      } catch (err) {
        console.error('Image upload error:', err);
        alert('이미지 업로드에 실패했습니다. URL이 있으면 URL을 사용합니다.');
        themeImageUrl = settingsImageUrl.trim() || activeRoom.themeImageUrl || '';
      }
    }

    const updates = {
      name: settingsName.trim(),
      description: settingsDesc.trim(),
      themeImageUrl,
      allowGuestView: settingsAllowGuestView
    };
    const success = await updateRoomInfo(activeRoom.id, updates);
    if (success) {
      setActiveRoom(prev => ({ ...prev, ...updates }));
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, ...updates } : r));
    }
    setIsUploadingRoomImage(false);
    setShowRoomSettingsModal(false);
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
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>📅 {t('set_public_schedule')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block' }}>{t('select_plan_to_share')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plans.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handleUpdateSharedPlan(p.id)}
                    style={{
                      border: selectedPlanId === p.id ? '2.5px solid #3b82f6' : '2px solid var(--border-main)',
                      padding: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: selectedPlanId === p.id ? '#eff6ff' : 'white',
                      boxShadow: selectedPlanId === p.id ? 'none' : 'var(--shadow-hard-sm)'
                    }}
                  >
                    <span style={{ fontWeight: selectedPlanId === p.id ? '900' : 'bold', color: selectedPlanId === p.id ? '#1d4ed8' : 'var(--text-main)' }}>
                      {p.name}
                    </span>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: selectedPlanId === p.id ? '6px solid #3b82f6' : '2px solid var(--border-main)',
                      backgroundColor: 'white'
                    }} />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', lineHeight: '1.4' }}>
                {t('auto_save_share_desc')}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => setShowPlanChangeModal(false)}>{t('cancel') === 'Cancel' ? 'Close' : (t('cancel') === '取消' ? '关闭' : '닫기')}</button>
            </div>
          </div>
        </div>
      )}

      {showRoomSettingsModal && activeRoom && (
        <div className="modal-overlay" onClick={() => setShowRoomSettingsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-main)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.3rem' }}>⚙️ {t('room_settings')}</h2>
              <button 
                type="button" 
                onClick={() => setShowRoomSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Settings Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-main)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setSettingsTab('info')}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontWeight: '900',
                  backgroundColor: settingsTab === 'info' ? 'var(--text-main)' : 'white',
                  color: settingsTab === 'info' ? 'white' : 'var(--text-main)',
                  boxShadow: settingsTab === 'info' ? 'none' : 'var(--shadow-hard-sm)'
                }}
              >
                {t('general_info')}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setSettingsTab('members')}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: settingsTab === 'members' ? 'var(--text-main)' : 'white',
                  color: settingsTab === 'members' ? 'white' : 'var(--text-main)',
                  boxShadow: settingsTab === 'members' ? 'none' : 'var(--shadow-hard-sm)'
                }}
              >
                <Users size={15} /> {t('member_manage')} ({activeRoom.memberIds?.length || 0})
              </button>
            </div>

            {settingsTab === 'info' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>방 이름</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={settingsName}
                    onChange={e => setSettingsName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>방 소개글</label>
                  <textarea 
                    className="input-field" 
                    value={settingsDesc}
                    onChange={e => setSettingsDesc(e.target.value)}
                    placeholder="우리 방을 소개하는 짧은 글을 적어주세요!"
                    style={{ resize: 'vertical', minHeight: '70px' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                    방 대표 이미지
                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>파일 업로드 시 자동 압축 (최대 150KB)</span>
                  </label>
                  {/* Preview */}
                  {settingsImagePreview && (
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.6rem' }}>
                      <img 
                        src={settingsImagePreview} 
                        alt="preview" 
                        style={{ width: '64px', height: '64px', objectFit: 'cover', border: '2px solid var(--border-main)', borderRadius: '50%' }}
                      />
                      <button
                        type="button"
                        onClick={() => { setSettingsImagePreview(null); setSettingsImageFile(null); setSettingsImageUrl(''); }}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                  {/* File Upload */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.9rem', border: '2px dashed var(--border-main)', fontWeight: 'bold', backgroundColor: '#f8fafc', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    <Upload size={15} />
                    {settingsImageFile ? settingsImageFile.name : '파일 선택 (JPG, PNG, WEBP)'}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleRoomImageChange}
                    />
                  </label>
                  {/* URL Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>또는 URL</span>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsImageUrl}
                      onChange={e => {
                        setSettingsImageUrl(e.target.value);
                        setSettingsImageFile(null);
                        if (e.target.value.trim()) {
                          setSettingsImagePreview(e.target.value.trim());
                        } else {
                          setSettingsImagePreview(null);
                        }
                      }}
                      placeholder="https://... 이미지 주소 직접 입력"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem 0.7rem' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox"
                      checked={settingsAllowGuestView}
                      onChange={e => setSettingsAllowGuestView(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    비회원/미참여자의 시간표 & 게시판 탐색 허용
                  </label>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
                    체크 해제 시 방에 참여한 정회원만 시간표와 게시판을 열람할 수 있습니다.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-main)' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>방 삭제</span>
                  <button className="btn btn-sm btn-danger" onClick={() => {
                    setShowRoomSettingsModal(false);
                    handleDeleteRoom();
                  }}>
                    <Trash2 size={15}/> 이 방 삭제
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn" onClick={() => setShowRoomSettingsModal(false)}>취소</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveRoomSettings}
                    disabled={isUploadingRoomImage || !settingsName.trim()}
                  >
                    {isUploadingRoomImage ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              /* Members Management Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  방장 권한으로 멤버를 강퇴하거나 방장 권한을 위임할 수 있습니다.
                </div>
                {activeRoom.memberIds?.map(mId => {
                  const mInfo = activeRoom.memberDetails?.[mId] || { name: '알 수 없음' };
                  const isOwner = activeRoom.ownerId === mId;
                  const isMe = mId === user.uid;

                  return (
                    <div 
                      key={mId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        border: '2px solid var(--border-main)',
                        backgroundColor: isMe ? '#f8fafc' : 'white',
                        boxShadow: 'var(--shadow-hard-sm)',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem', backgroundColor: 'white', flexShrink: 0 }}>
                          {mInfo.name ? mInfo.name.substring(0, 1) : '?'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mInfo.name}</span>
                            {isOwner && <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--text-main)', color: 'white', padding: '0.05rem 0.3rem', fontWeight: '900' }}>{t('room_owner')}</span>}
                            {isMe && <span style={{ fontSize: '0.65rem', border: '1.5px solid var(--border-main)', padding: '0.05rem 0.3rem', fontWeight: 'bold' }}>{t('room_me')}</span>}
                          </div>
                          {mInfo.statusMessage && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{mInfo.statusMessage}"
                            </div>
                          )}
                        </div>
                      </div>

                      {activeRoom.ownerId === user.uid && !isOwner && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          <button 
                            type="button"
                            className="btn btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                            onClick={() => handleTransferOwnership(mId, mInfo.name)}
                          >
                            {t('delegate_owner')}
                          </button>
                          <button 
                            type="button"
                            className="btn btn-sm btn-danger"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                            onClick={() => handleKickMember(mId, mInfo.name)}
                          >
                            {t('kick')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
