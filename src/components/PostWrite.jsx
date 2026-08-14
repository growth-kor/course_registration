import React from 'react';
import { Send, Edit2, Loader, Image as ImageIcon } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { updatePost, addPost, uploadImage } from '../firebase/config';

export function PostWrite({
  newPostTitle, setNewPostTitle,
  newPostContent, setNewPostContent,
  newPostCategory, setNewPostCategory,
  pollOptions, setPollOptions,
  isUploadingImage, setIsUploadingImage
}) {
  const {
    user, activeRoom, loadPosts, editPostId, setEditPostId, setBoardView
  } = useSharedSpace();

  const handleImageUpload = (onSuccess) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsUploadingImage(true);
      const url = await uploadImage(file, `rooms/${activeRoom.id}/images`);
      setIsUploadingImage(false);
      if (url) {
        onSuccess(url);
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    };
    input.click();
  };

  const handleAddPost = async () => {
    if ((!newPostTitle.trim() && !newPostContent.trim()) || !activeRoom) return;
    
    const validPollOptions = pollOptions.filter(o => o.trim() !== '');
    const pollData = newPostCategory === '투표' && validPollOptions.length >= 2 
      ? { options: validPollOptions, multipleChoice: false } 
      : null;

    if (editPostId) {
      const success = await updatePost(activeRoom.id, editPostId, newPostCategory, newPostTitle.trim(), newPostContent.trim());
      if (success) {
        setEditPostId(null);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('일반');
        setPollOptions(['', '']);
        setBoardView('list');
        loadPosts();
      } else {
        alert("글 수정에 실패했습니다.");
      }
    } else {
      const post = await addPost(
        activeRoom.id, 
        user.uid, 
        user.displayName || '이름 없음', 
        newPostCategory, 
        newPostTitle.trim(), 
        newPostContent.trim(),
        pollData
      );
      if (post) {
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('일반');
        setPollOptions(['', '']);
        setBoardView('list');
        loadPosts();
      } else {
        alert("글 작성에 실패했습니다.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', border: '2px solid var(--border-main)', padding: '2rem' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', borderBottom: '2px solid var(--border-main)', paddingBottom: '1rem' }}>
        {editPostId ? '글 수정하기' : '새 글 쓰기'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="input-field" 
            value={newPostCategory} 
            onChange={e => setNewPostCategory(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="일반">일반</option>
            <option value="공지">공지</option>
            <option value="질문">질문</option>
            <option value="투표">투표</option>
          </select>
          <input 
            type="text" 
            className="input-field" 
            placeholder="제목을 입력하세요"
            value={newPostTitle}
            onChange={e => setNewPostTitle(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <textarea 
            className="input-field" 
            placeholder="내용을 입력하세요 (마크다운 지원)"
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            style={{ minHeight: '300px', resize: 'vertical', width: '100%', paddingBottom: '3rem' }}
          />
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
            <button 
              className="btn" 
              style={{ padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9' }}
              onClick={() => handleImageUpload((url) => {
                setNewPostContent(prev => prev + `\n![이미지](${url})\n`);
              })}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? <Loader size={16} className="spin" /> : <ImageIcon size={16} />}
              사진 첨부
            </button>
          </div>
        </div>

        {newPostCategory === '투표' && (
          <div style={{ marginTop: '1.5rem', backgroundColor: '#f1f5f9', padding: '1.5rem', border: '2px solid var(--border-main)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              투표 항목
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pollOptions.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`항목 ${idx + 1}`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...pollOptions];
                      newOpts[idx] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    style={{ flex: 1, padding: '0.5rem' }}
                  />
                  {pollOptions.length > 2 && (
                    <button 
                      className="btn" 
                      onClick={() => {
                        const newOpts = [...pollOptions];
                        newOpts.splice(idx, 1);
                        setPollOptions(newOpts);
                      }}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              className="btn" 
              onClick={() => setPollOptions([...pollOptions, ''])}
              style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', backgroundColor: 'white', fontWeight: 'bold' }}
            >
              + 항목 추가
            </button>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            className="btn" 
            style={{ padding: '0.75rem 2rem', backgroundColor: '#f1f5f9', fontWeight: 'bold' }} 
            onClick={() => {
              setBoardView(editPostId ? 'detail' : 'list');
              if (!editPostId) {
                setNewPostTitle('');
                setNewPostContent('');
              }
            }}
          >
            취소
          </button>
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.75rem 2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
            onClick={handleAddPost} 
            disabled={!newPostTitle.trim() && !newPostContent.trim()}
          >
            {editPostId ? <><Edit2 size={18} /> 수정 완료</> : <><Send size={18} /> 등록</>}
          </button>
        </div>
      </div>
    </div>
  );
}
