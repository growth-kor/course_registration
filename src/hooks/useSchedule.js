import { useState, useEffect, useCallback } from 'react';
import { INITIAL_SAMPLE_BLOCKS } from '../constants/presets';
import {
  initFirebase,
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  loginWithGoogle,
  logoutUser,
  saveScheduleToFirestore,
  loadScheduleFromFirestore
} from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const STORAGE_KEY_BLOCKS = 'brutalist_planner_blocks_v1';
const STORAGE_KEY_SETTINGS = 'brutalist_planner_settings_v1';

export function useSchedule() {
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BLOCKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load blocks from localStorage", e);
    }
    return INITIAL_SAMPLE_BLOCKS;
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return { showWeekend: true, gridStartHour: 6, gridEndHour: 24, hourRowHeight: 60 };
  });

  const [user, setUser] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState({ isConfigured: false, loading: true });

  // Save to LocalStorage whenever blocks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
    } catch (e) {
      console.error("Error saving blocks to localStorage", e);
    }
  }, [blocks]);

  // Save settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings", e);
    }
  }, [settings]);

  // Initialize Firebase & Listen for auth changes
  useEffect(() => {
    const { isConfigured, auth } = initFirebase();
    setFirebaseStatus({ isConfigured, loading: false });

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Cloud Sync: fetch remote schedule
          const remoteBlocks = await loadScheduleFromFirestore(currentUser.uid);
          if (remoteBlocks && Array.isArray(remoteBlocks) && remoteBlocks.length > 0) {
            setBlocks(remoteBlocks);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync to Cloud whenever blocks change (if logged in)
  const syncToCloud = useCallback(async (currentBlocks) => {
    if (user) {
      await saveScheduleToFirestore(user.uid, currentBlocks);
    }
  }, [user]);

  // Block CRUD Operations
  const addBlock = (newBlockData) => {
    const newBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subtasks: [],
      memo: '',
      isFixed: true,
      ...newBlockData
    };
    setBlocks(prev => {
      const updated = [...prev, newBlock];
      syncToCloud(updated);
      return updated;
    });
  };

  const updateBlock = (id, updatedFields) => {
    setBlocks(prev => {
      const updated = prev.map(blk => blk.id === id ? { ...blk, ...updatedFields } : blk);
      syncToCloud(updated);
      return updated;
    });
  };

  const deleteBlock = (id) => {
    setBlocks(prev => {
      const updated = prev.filter(blk => blk.id !== id);
      syncToCloud(updated);
      return updated;
    });
  };

  const toggleSubtask = (blockId, subtaskId) => {
    setBlocks(prev => {
      const updated = prev.map(blk => {
        if (blk.id !== blockId) return blk;
        const updatedSubtasks = (blk.subtasks || []).map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...blk, subtasks: updatedSubtasks };
      });
      syncToCloud(updated);
      return updated;
    });
  };

  const addSubtask = (blockId, text) => {
    if (!text.trim()) return;
    setBlocks(prev => {
      const updated = prev.map(blk => {
        if (blk.id !== blockId) return blk;
        const newSubtask = {
          id: `st_${Date.now()}`,
          text: text.trim(),
          completed: false
        };
        return { ...blk, subtasks: [...(blk.subtasks || []), newSubtask] };
      });
      syncToCloud(updated);
      return updated;
    });
  };

  const deleteSubtask = (blockId, subtaskId) => {
    setBlocks(prev => {
      const updated = prev.map(blk => {
        if (blk.id !== blockId) return blk;
        return { ...blk, subtasks: (blk.subtasks || []).filter(st => st.id !== subtaskId) };
      });
      syncToCloud(updated);
      return updated;
    });
  };

  const resetToSample = () => {
    setBlocks(INITIAL_SAMPLE_BLOCKS);
    syncToCloud(INITIAL_SAMPLE_BLOCKS);
  };

  const importBlocks = (newBlocks) => {
    if (Array.isArray(newBlocks)) {
      setBlocks(newBlocks);
      syncToCloud(newBlocks);
    }
  };

  const toggleWeekend = () => {
    setSettings(prev => ({ ...prev, showWeekend: !prev.showWeekend }));
  };

  // Firebase Configuration Update
  const updateFirebaseKeys = (config) => {
    saveFirebaseConfig(config);
    const { isConfigured } = initFirebase(config);
    setFirebaseStatus({ isConfigured, loading: false });
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert(`로그인 실패: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return {
    blocks,
    settings,
    user,
    firebaseStatus,
    addBlock,
    updateBlock,
    deleteBlock,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    resetToSample,
    importBlocks,
    toggleWeekend,
    updateFirebaseKeys,
    handleGoogleLogin,
    handleLogout
  };
}
