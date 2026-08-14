import React from 'react';
import { ThumbsUp, MessageSquare, Trash2, Edit2, Loader, Image as ImageIcon } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { togglePostLike, addComment, deleteComment, deletePost, votePoll, uploadImage } from '../firebase/config';

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, idx) => {
    // Images
    const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      return (
        <div key={idx} style={{ margin: '1rem 0' }}>
          <img src={imgMatch[2]} alt={imgMatch[1] || '이미지'} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', border: '2px solid var(--border-main)' }} />
        </div>
      );
    }
    // Blockquote
    if (line.trim().startsWith('> ')) {
      return (
        <blockquote key={idx} style={{ borderLeft: '4px solid var(--text-main)', margin: '0.5rem 0', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {line.trim().substring(2)}
        </blockquote>
      );
    }
    // List items
    if (line.trim().startsWith('- ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>
          <span style={{ fontWeight: '900' }}>•</span>
          <span>{line.trim().substring(2)}</span>
        </div>
      );
    }
    // Bold
    let parsedLine = line;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(<strong key={`${idx}-${match.index}`} style={{ fontWeight: '900' }}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    return <span key={idx}>{parts.length > 0 ? parts : line}<br /></span>;
  });
};

export function PostDetail({
  postComments, setPostComments,
  newCommentContent, setNewCommentContent,
  replyToCommentId, setReplyToCommentId,
  loadingComments,
  isUploadingImage, setIsUploadingImage,
  setNewPostTitle, setNewPostContent, setNewPostCategory
}) {
  const {
    user, activeRoom, loadPosts, setBoardView,
    selectedPost, setSelectedPost, setPosts, setEditPostId,
    expandedPollOptions, setExpandedPollOptions
  } = useSharedSpace();

  const handleLikePost = async () => {
    if (!activeRoom || !selectedPost) return;
    const result = await togglePostLike(activeRoom.id, selectedPost.id, user.uid);
    if (result !== false) {
      const newLikes = result.liked 
        ? [...(selectedPost.likes || []), user.uid] 
        : (selectedPost.likes || []).filter(id => id !== user.uid);
      
      setSelectedPost(prev => ({ ...prev, likes: newLikes }));
      setPosts(prevPosts => prevPosts.map(p => p.id === selectedPost.id ? { ...p, likes: newLikes } : p));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!activeRoom) return;
    if (window.confirm("이 글을 삭제하시겠습니까?")) {
      const success = await deletePost(activeRoom.id, postId);
      if (success) {
        loadPosts();
        if (selectedPost && selectedPost.id === postId) {
          setBoardView('list');
          setSelectedPost(null);
        }
      } else {
        alert("글 삭제에 실패했습니다.");
      }
    }
  };

  const handleEditClick = (post) => {
    setEditPostId(post.id);
    setNewPostTitle(post.title || '');
    setNewPostContent(post.content || '');
    setNewPostCategory(post.category || '일반');
    setBoardView('write');
  };

  const handleAddComment = async () => {
    if (!activeRoom || !selectedPost || !newCommentContent.trim()) return;
    const comment = await addComment(activeRoom.id, selectedPost.id, user.uid, user.displayName || '이름 없음', newCommentContent.trim(), replyToCommentId);
    if (comment) {
      setNewCommentContent('');
      setReplyToCommentId(null);
      setPostComments(prev => [...prev, comment]);
      setPosts(prevPosts => prevPosts.map(p => p.id === selectedPost.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
      setSelectedPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeRoom || !selectedPost) return;
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      const success = await deleteComment(activeRoom.id, selectedPost.id, commentId);
      if (success) {
        setPostComments(prev => prev.filter(c => c.id !== commentId));
        setPosts(prevPosts => prevPosts.map(p => p.id === selectedPost.id ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p));
        setSelectedPost(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) }));
      }
    }
  };

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

  if (!selectedPost) return null;

  return (
    <div style={{ backgroundColor: 'white', border: '2px solid var(--border-main)', boxShadow: 'var(--shadow-hard)' }}>
      {/* Post Header */}
      <div style={{ padding: '2rem', borderBottom: '2px solid var(--border-main)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ padding: '0.25rem 0.75rem', backgroundColor: selectedPost.category === '공지' ? '#fee2e2' : 'var(--bg-main)', color: selectedPost.category === '공지' ? '#ef4444' : 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem', border: '2px solid var(--border-main)' }}>
            {selectedPost.category || '일반'}
          </span>
        </div>
        <h2 style={{ margin: '0 0 1rem 0', fontWeight: '900', fontSize: '1.8rem', lineHeight: '1.3' }}>
          {selectedPost.title}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontWeight: 'bold' }}>
            <span>작성자: {selectedPost.authorName}</span>
            <span>•</span>
            <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>조회 {selectedPost.views || 0}</span>
          </div>
          {selectedPost.authorId === user.uid && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm" onClick={() => handleEditClick(selectedPost)}>수정</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(selectedPost.id)}>삭제</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div style={{ padding: '3rem 2rem', fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-main)', minHeight: '200px' }}>
        {renderMarkdown(selectedPost.content)}

        {/* Poll UI */}
        {selectedPost.category === '투표' && selectedPost.poll && (
          <div style={{ marginTop: '2rem', backgroundColor: '#f8fafc', padding: '1.5rem', border: '2px solid var(--border-main)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900' }}>📊 투표</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedPost.poll.options.map((opt, idx) => {
                const isVoted = selectedPost.poll.votes?.[idx]?.includes(user.uid);
                const voteCount = selectedPost.poll.votes?.[idx]?.length || 0;
                const totalVotes = selectedPost.poll.options.reduce((sum, _, i) => sum + (selectedPost.poll.votes?.[i]?.length || 0), 0);
                const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                
                const isExpanded = expandedPollOptions[`${selectedPost.id}_${idx}`];
                const voters = selectedPost.poll.votes?.[idx] || [];
                const voterNames = voters.map(vId => activeRoom.memberDetails?.[vId]?.name || '알 수 없음').join(', ');
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div 
                      style={{ 
                        display: 'flex', alignItems: 'center', cursor: 'pointer',
                        padding: '1rem', backgroundColor: 'white', border: '2px solid var(--border-main)',
                        boxShadow: isVoted ? 'inset 0 0 0 2px var(--color-primary)' : 'none',
                        position: 'relative', overflow: 'hidden'
                      }}
                      onClick={async () => {
                        const success = await votePoll(activeRoom.id, selectedPost.id, user.uid, idx);
                        if (success) {
                           setSelectedPost(prev => {
                              const newVotes = { ...prev.poll.votes };
                              // remove previous vote
                              Object.keys(newVotes).forEach(k => {
                                 newVotes[k] = (newVotes[k] || []).filter(id => id !== user.uid);
                              });
                              // add new vote
                              newVotes[idx] = [...(newVotes[idx] || []), user.uid];
                              return { ...prev, poll: { ...prev.poll, votes: newVotes } };
                           });
                        }
                      }}
                    >
                      <div style={{ 
                        position: 'absolute', top: 0, left: 0, bottom: 0, 
                        width: `${percentage}%`, backgroundColor: 'var(--color-primary)', opacity: 0.2, zIndex: 0,
                        transition: 'width 0.3s ease'
                      }} />
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-main)', backgroundColor: isVoted ? 'var(--text-main)' : 'transparent' }} />
                          {opt}
                        </div>
                        <span>{voteCount}표 ({percentage}%)</span>
                      </div>
                    </div>
                    {voteCount > 0 && (
                      <button 
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                        onClick={() => setExpandedPollOptions(prev => ({ ...prev, [`${selectedPost.id}_${idx}`]: !prev[`${selectedPost.id}_${idx}`] }))}
                      >
                        {isExpanded ? '투표자 숨기기 ▲' : '투표자 보기 ▼'}
                      </button>
                    )}
                    {isExpanded && voteCount > 0 && (
                      <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px dashed var(--border-main)', fontSize: '0.9rem' }}>
                        {voterNames}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              총 {selectedPost.poll.options.reduce((sum, _, i) => sum + (selectedPost.poll.votes?.[i]?.length || 0), 0)}명 참여
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn" 
          onClick={handleLikePost}
          style={{ 
            padding: '0.75rem 2rem', 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            fontWeight: '900', fontSize: '1.1rem',
            backgroundColor: selectedPost.likes?.includes(user.uid) ? 'var(--color-primary)' : 'white',
            transform: selectedPost.likes?.includes(user.uid) ? 'translate(2px, 2px)' : 'none',
            boxShadow: selectedPost.likes?.includes(user.uid) ? 'none' : 'var(--shadow-hard-sm)'
          }}
        >
          <ThumbsUp size={20} /> 추천 {selectedPost.likes?.length || 0}
        </button>
      </div>

      {/* Comments Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderTop: '2px solid var(--border-main)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} /> 댓글 {postComments.length}
        </h3>
        
        {loadingComments ? (
          <div style={{ padding: '2rem', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)' }}>[ 댓글 불러오는 중... ]</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {postComments.map(comment => (
              <div key={comment.id} style={{ 
                backgroundColor: 'white', 
                border: '2px solid var(--border-main)', 
                padding: '1.5rem',
                marginLeft: comment.replyTo ? '2rem' : '0',
                borderLeft: comment.replyTo ? '4px solid var(--color-primary)' : '2px solid var(--border-main)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '900' }}>{comment.authorName}</div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                    {comment.authorId === user.uid && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ lineHeight: '1.5', wordBreak: 'break-all' }}>
                   {renderMarkdown(comment.content)}
                </div>
                {!comment.replyTo && (
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.5rem', cursor: 'pointer', padding: 0 }}
                    onClick={() => setReplyToCommentId(comment.id === replyToCommentId ? null : comment.id)}
                  >
                    {comment.id === replyToCommentId ? '답글 취소' : '답글 달기'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid var(--border-main)', 
          padding: '1rem',
          marginLeft: replyToCommentId ? '2rem' : '0'
        }}>
          {replyToCommentId && (
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              답글 작성 중...
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <textarea 
              className="input-field" 
              placeholder={replyToCommentId ? "답글을 남겨보세요" : "댓글을 남겨보세요 (마크다운 지원)"}
              value={newCommentContent}
              onChange={e => setNewCommentContent(e.target.value)}
              style={{ width: '100%', minHeight: '80px', resize: 'vertical', paddingBottom: '3rem' }}
            />
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem' }}>
               <button 
                 className="btn" 
                 style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f1f5f9' }}
                 onClick={() => handleImageUpload((url) => {
                   setNewCommentContent(prev => prev + `\n![이미지](${url})\n`);
                 })}
                 disabled={isUploadingImage}
               >
                 {isUploadingImage ? <Loader size={14} className="spin" /> : <ImageIcon size={14} />}
                 사진
               </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAddComment} disabled={!newCommentContent.trim()}>
              등록
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '1.5rem', borderTop: '2px solid var(--border-main)', textAlign: 'center' }}>
        <button className="btn" onClick={() => {
          setBoardView('list');
          setSelectedPost(null);
        }}>
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
