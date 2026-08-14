import React from 'react';
import { Search, Edit2 } from 'lucide-react';
import { useSharedSpace } from '../context/SharedSpaceContext';
import { fetchComments, incrementPostView } from '../firebase/config';

export function BoardList({ 
  setPostComments, setLoadingComments, 
  setNewPostTitle, setNewPostContent, setNewPostCategory, setPollOptions,
  setBoardView
}) {
  const {
    user, activeRoom, posts, setPosts, loadingPosts, viewedPosts,
    searchQuery, setSearchQuery, searchType, setSearchType,
    currentPage, setCurrentPage, POSTS_PER_PAGE,
    setEditPostId, setSelectedPost, onRequireLogin
  } = useSharedSpace();

  const handleSelectPost = async (post) => {
    setSelectedPost(post);
    setBoardView('detail');
    setLoadingComments(true);
    const comments = await fetchComments(activeRoom.id, post.id);
    setPostComments(comments);
    setLoadingComments(false);

    if (!viewedPosts.has(post.id)) {
      viewedPosts.add(post.id);
      const success = await incrementPostView(activeRoom.id, post.id);
      if (success) {
        setSelectedPost(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
        setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p));
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (searchType === 'title') return (post.title || '').toLowerCase().includes(query);
    if (searchType === 'content') return (post.content || '').toLowerCase().includes(query);
    if (searchType === 'author') return (post.authorName || '').toLowerCase().includes(query);
    return true;
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            className="input-field" 
            value={searchType} 
            onChange={e => setSearchType(e.target.value)}
            style={{ padding: '0.5rem', width: '100px' }}
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="author">작성자</option>
          </select>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.5rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="게시글 검색..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', width: '250px' }}
            />
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1.5rem', fontWeight: 'bold' }} 
          onClick={() => {
            if (!user) {
              onRequireLogin();
              return;
            }
            setEditPostId(null);
            setNewPostTitle('');
            setNewPostContent('');
            setNewPostCategory('일반');
            setPollOptions(['', '']);
            setBoardView('write');
          }}
        >
          <Edit2 size={18} /> 새 글 쓰기
        </button>
      </div>
      <div style={{ backgroundColor: 'white', border: '2px solid var(--border-main)', boxShadow: 'var(--shadow-hard)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-main)', fontWeight: '900', fontSize: '1.05rem' }}>
              <th style={{ padding: '1rem', width: '80px', borderRight: '2px solid var(--border-main)' }}>분류</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>제목</th>
              <th style={{ padding: '1rem', width: '120px', borderLeft: '2px solid var(--border-main)' }}>글쓴이</th>
              <th style={{ padding: '1rem', width: '120px', borderLeft: '2px solid var(--border-main)' }}>날짜</th>
              <th style={{ padding: '1rem', width: '80px', borderLeft: '2px solid var(--border-main)' }}>조회</th>
              <th style={{ padding: '1rem', width: '80px', borderLeft: '2px solid var(--border-main)' }}>추천</th>
            </tr>
          </thead>
          <tbody>
            {loadingPosts ? (
              <tr><td colSpan="6" style={{ padding: '3rem', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)' }}>[ 게시글 목록을 불러오는 중... ]</td></tr>
            ) : currentPosts.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>검색 결과가 없거나 등록된 글이 없습니다.</td></tr>
            ) : (
              currentPosts.map(post => (
                <tr 
                  key={post.id} 
                  style={{ borderBottom: '1px solid var(--border-main)', cursor: 'pointer', transition: 'background-color 0.2s' }} 
                  onClick={() => handleSelectPost(post)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: '0.75rem 1rem', borderRight: '2px solid var(--border-main)', fontWeight: 'bold', color: post.category === '공지' ? '#ef4444' : 'var(--text-main)' }}>
                    {post.category || '일반'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                    {post.title || '(제목 없음)'}
                    {post.commentCount > 0 && <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontSize: '0.9rem' }}>[{post.commentCount}]</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderLeft: '2px solid var(--border-main)', fontSize: '0.9rem' }}>
                    {post.authorName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderLeft: '2px solid var(--border-main)', fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderLeft: '2px solid var(--border-main)', fontSize: '0.9rem', color: '#64748b' }}>
                    {post.views || 0}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderLeft: '2px solid var(--border-main)', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                    {post.likes?.length || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`btn btn-sm ${currentPage === page ? 'btn-primary' : ''}`}
              onClick={() => setCurrentPage(page)}
              style={{ padding: '0.2rem 0.6rem', minWidth: '32px' }}
            >
              {page}
            </button>
          ))}
          <button 
            className="btn btn-sm" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
