import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchRoomsForUser, fetchPublicRooms, loadScheduleFromFirestore, fetchPosts, fetchComments, incrementPostView } from '../firebase/config';

const SharedSpaceContext = createContext();

export function useSharedSpace() {
  const context = useContext(SharedSpaceContext);
  if (!context) {
    throw new Error('useSharedSpace must be used within a SharedSpaceProvider');
  }
  return context;
}

export function SharedSpaceProvider({ 
  children, 
  user, 
  plans, 
  firebaseStatus, 
  onRequireLogin, 
  onOpenProfileSettings 
}) {
  const [rooms, setRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [sidebarTab, setSidebarTab] = useState(() => sessionStorage.getItem('sidebarTab') || 'my_rooms'); // 'my_rooms' or 'explore'
  const [loading, setLoading] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [memberScheduleData, setMemberScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [roomTab, setRoomTab] = useState(() => sessionStorage.getItem('roomTab') || 'schedule'); // 'schedule' or 'board'
  const [boardView, setBoardView] = useState(() => sessionStorage.getItem('boardView') || 'list'); // 'list' | 'write' | 'detail'
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewedPosts] = useState(() => new Set());
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  // Board Search & Pagination (Keep globally if it affects list/detail navigation)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title', 'content', 'author'
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 15;

  const [sharedPlanIdToJoin, setSharedPlanIdToJoin] = useState('');
  const [editPostId, setEditPostId] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);

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
    
    const storedRoomId = sessionStorage.getItem('activeRoomId');
    const matchedRoom = storedRoomId ? userRooms.find(r => r.id === storedRoomId) : null;
    
    if (matchedRoom) {
      setActiveRoom(matchedRoom);
    } else {
      setActiveRoom(null);
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
    sessionStorage.setItem('sidebarTab', sidebarTab);
  }, [sidebarTab]);

  useEffect(() => {
    sessionStorage.setItem('roomTab', roomTab);
  }, [roomTab]);

  useEffect(() => {
    sessionStorage.setItem('boardView', boardView);
  }, [boardView]);

  useEffect(() => {
    if (activeRoom) {
      sessionStorage.setItem('activeRoomId', activeRoom.id);
      localStorage.setItem(`last_visited_${activeRoom.id}`, new Date().toISOString());
      // Default to current user's own schedule; fallback to owner if user is not a member
      setActiveMemberId(user?.uid || activeRoom.ownerId);
    } else {
      sessionStorage.removeItem('activeRoomId');
    }
  }, [activeRoom]);

  useEffect(() => {
    async function loadMemberSchedule() {
      if (!activeMemberId) return;
      setLoadingSchedule(true);

      if (activeMemberId === '__all__') {
        const allData = { plans: [{ id: '__all__', name: '시간표 종합 (Heatmap)', blocks: [] }], categories: {} };
        const memberIds = activeRoom?.memberIds || [];
        const groupedBlocks = {};
        
        for (const mId of memberIds) {
          try {
            const mData = await loadScheduleFromFirestore(mId);
            if (mData && mData.plans && mData.plans.length > 0) {
               const mSharedPlanId = activeRoom?.memberDetails?.[mId]?.sharedPlanId;
               const mPlan = mData.plans.find(p => p.id === mSharedPlanId) || mData.plans[0];
               if (mPlan && mPlan.blocks) {
                  mPlan.blocks.forEach(b => {
                     (b.timeSlots || []).forEach(ts => {
                         const key = `${ts.dayOfWeek}_${ts.startTime}_${ts.endTime}`;
                         if (!groupedBlocks[key]) {
                             groupedBlocks[key] = {
                                 id: key,
                                 title: '일정 있음',
                                 isHeatmap: true,
                                 timeSlots: [ts],
                                 heatmapUsers: []
                             };
                         }
                         groupedBlocks[key].heatmapUsers.push(activeRoom?.memberDetails?.[mId]?.name || '알 수 없음');
                     });
                  });
               }
            }
          } catch (err) {
            console.error("Error loading member schedule", mId, err);
          }
        }
        
        allData.plans[0].blocks = Object.values(groupedBlocks).map(b => ({
            ...b,
            title: `${b.heatmapUsers.join(', ')} (${b.heatmapUsers.length}명)`
        }));
        
        setMemberScheduleData(allData);
        setSelectedPlanId('__all__');
      } else {
        try {
          let data = await loadScheduleFromFirestore(activeMemberId);
          // If viewing own schedule and Firestore data is empty or missing, fallback to local plans
          if (activeMemberId === user?.uid && (!data || !data.plans || data.plans.length === 0) && plans && plans.length > 0) {
            data = { plans, categories: {} };
          }

          if (data && data.plans && data.plans.length > 0) {
            setMemberScheduleData(data);
            const memberSharedPlanId = activeRoom?.memberDetails?.[activeMemberId]?.sharedPlanId;
            const defaultPlanId = data.plans[0].id;
            
            const matchedPlan = data.plans.find(p => p.id === memberSharedPlanId);
            setSelectedPlanId(matchedPlan ? memberSharedPlanId : defaultPlanId);
          } else {
            setMemberScheduleData({ plans: [], categories: {} });
            setSelectedPlanId('');
          }
        } catch (err) {
          console.error("Error loading schedule from firestore", err);
          if (activeMemberId === user?.uid && plans && plans.length > 0) {
            setMemberScheduleData({ plans, categories: {} });
            setSelectedPlanId(plans[0].id);
          } else {
            setMemberScheduleData({ plans: [], categories: {} });
            setSelectedPlanId('');
          }
        }
      }
      setLoadingSchedule(false);
    }
    loadMemberSchedule();
  }, [activeMemberId, activeRoom, user?.uid, plans]);

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
      setBoardView('list');
    }
  }, [activeRoom, roomTab]);

  const value = {
    user, plans, firebaseStatus, onRequireLogin, onOpenProfileSettings,
    rooms, setRooms, loadRooms,
    publicRooms, setPublicRooms,
    sidebarTab, setSidebarTab,
    loading, setLoading,
    loadingExplore, setLoadingExplore,
    activeRoom, setActiveRoom,
    activeMemberId, setActiveMemberId,
    memberScheduleData, setMemberScheduleData,
    loadingSchedule, setLoadingSchedule,
    roomTab, setRoomTab,
    boardView, setBoardView,
    selectedPost, setSelectedPost,
    posts, setPosts, loadPosts,
    loadingPosts, setLoadingPosts,
    toastMessage, setToastMessage,
    viewedPosts,
    selectedPlanId, setSelectedPlanId,
    searchQuery, setSearchQuery,
    searchType, setSearchType,
    currentPage, setCurrentPage,
    POSTS_PER_PAGE,
    sharedPlanIdToJoin, setSharedPlanIdToJoin,
    editPostId, setEditPostId,
    showCreateModal, setShowCreateModal,
    showJoinModal, setShowJoinModal,
    showPlanChangeModal, setShowPlanChangeModal,
    showRoomSettingsModal, setShowRoomSettingsModal
  };

  return (
    <SharedSpaceContext.Provider value={value}>
      {children}
    </SharedSpaceContext.Provider>
  );
}
