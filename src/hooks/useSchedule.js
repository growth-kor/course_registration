import { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_SAMPLE_BLOCKS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants/presets';
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

const STORAGE_KEY_PLANS = 'brutalist_planner_plans_v2';
const STORAGE_KEY_CURRENT_PLAN = 'brutalist_planner_current_plan_v2';
const STORAGE_KEY_SETTINGS = 'brutalist_planner_settings_v1';
const STORAGE_KEY_CATEGORIES = 'brutalist_planner_categories_v1';

export function useSchedule() {
  const [plans, setPlans] = useState(() => {
    try {
      const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
      if (savedPlans) return JSON.parse(savedPlans);
      
      // Migrate legacy blocks
      const legacyBlocks = localStorage.getItem('brutalist_planner_blocks_v1');
      if (legacyBlocks) {
        const blocks = JSON.parse(legacyBlocks);
        const migratedBlocks = blocks.map(b => {
          if (b.timeSlots) return b;
          const { dayOfWeek, startTime, endTime, ...rest } = b;
          return {
            ...rest,
            timeSlots: [{ id: `ts_${Math.random().toString(36).substring(2)}`, dayOfWeek, startTime, endTime }]
          };
        });
        return [{ id: 'default', name: '기본 플랜', blocks: migratedBlocks }];
      }
    } catch (e) {
      console.error("Failed to load plans from localStorage", e);
    }
    return [{ id: 'default', name: '기본 플랜', blocks: [] }];
  });

  const [currentPlanId, setCurrentPlanId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_CURRENT_PLAN) || 'default';
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return { showWeekend: true, gridStartHour: 6, gridEndHour: 30, hourRowHeight: 60 };
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Keep a ref to the latest categories for syncToCloud to avoid stale closures without needing to update all 14 call sites
  const categoriesRef = useRef(categories);
  useEffect(() => {
    categoriesRef.current = categories;
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Error saving categories", e);
    }
  }, [categories]);

  const [user, setUser] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState({ isConfigured: false, loading: true });

  // Save to LocalStorage whenever plans change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEY_CURRENT_PLAN, currentPlanId);
    } catch (e) {
      console.error("Error saving plans to localStorage", e);
    }
  }, [plans, currentPlanId]);

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
          const remotePlansData = await loadScheduleFromFirestore(currentUser.uid);
          if (remotePlansData && Array.isArray(remotePlansData.plans) && remotePlansData.plans.length > 0) {
            setPlans(remotePlansData.plans);
            if (remotePlansData.currentPlanId) {
              setCurrentPlanId(remotePlansData.currentPlanId);
            }
            if (
              remotePlansData.categories && 
              typeof remotePlansData.categories === 'object' && 
              !Array.isArray(remotePlansData.categories) &&
              Object.keys(remotePlansData.categories).length > 0
            ) {
              setCategories(remotePlansData.categories);
            }
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync to Cloud whenever plans change (if logged in)
  const syncToCloud = useCallback(async (currentPlans, currentId, currentCategories = categoriesRef.current) => {
    if (user) {
      await saveScheduleToFirestore(user.uid, { plans: currentPlans, currentPlanId: currentId, categories: currentCategories });
    }
  }, [user]);

  // Block CRUD Operations
  const addBlock = (newBlockData) => {
    const newBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subtasks: [],
      memo: '',
      isFixed: true,
      timeSlots: [],
      ...newBlockData
    };
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return { ...p, blocks: [...p.blocks, newBlock] };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const addBlocksBatch = (newBlocksDataArray) => {
    const newBlocks = newBlocksDataArray.map(data => ({
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subtasks: [],
      memo: '',
      isFixed: true,
      timeSlots: [],
      ...data
    }));
    
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return { ...p, blocks: [...p.blocks, ...newBlocks] };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const updateBlock = (id, updatedFields) => {
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return {
          ...p,
          blocks: p.blocks.map(blk => blk.id === id ? { ...blk, ...updatedFields } : blk)
        };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const deleteBlock = (id) => {
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return { ...p, blocks: p.blocks.filter(blk => blk.id !== id) };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const toggleSubtask = (blockId, subtaskId) => {
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return {
          ...p,
          blocks: p.blocks.map(blk => {
            if (blk.id !== blockId) return blk;
            const updatedSubtasks = (blk.subtasks || []).map(st => 
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            );
            return { ...blk, subtasks: updatedSubtasks };
          })
        };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const addSubtask = (blockId, text) => {
    if (!text.trim()) return;
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return {
          ...p,
          blocks: p.blocks.map(blk => {
            if (blk.id !== blockId) return blk;
            const newSubtask = {
              id: `st_${Date.now()}`,
              text: text.trim(),
              completed: false
            };
            return { ...blk, subtasks: [...(blk.subtasks || []), newSubtask] };
          })
        };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const deleteSubtask = (blockId, subtaskId) => {
    setPlans(prev => {
      const updatedPlans = prev.map(p => {
        if (p.id !== currentPlanId) return p;
        return {
          ...p,
          blocks: p.blocks.map(blk => {
            if (blk.id !== blockId) return blk;
            return { ...blk, subtasks: (blk.subtasks || []).filter(st => st.id !== subtaskId) };
          })
        };
      });
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const resetToSample = () => {
    const migratedSample = INITIAL_SAMPLE_BLOCKS.map(b => {
      const { dayOfWeek, startTime, endTime, ...rest } = b;
      return {
        ...rest,
        timeSlots: [{ id: `ts_${Math.random()}`, dayOfWeek, startTime, endTime }]
      };
    });
    setPlans(prev => {
      const updatedPlans = prev.map(p => p.id === currentPlanId ? { ...p, blocks: migratedSample } : p);
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const importBlocks = (newBlocks) => {
    if (Array.isArray(newBlocks)) {
      setPlans(prev => {
        const updatedPlans = prev.map(p => p.id === currentPlanId ? { ...p, blocks: newBlocks } : p);
        syncToCloud(updatedPlans, currentPlanId);
        return updatedPlans;
      });
    }
  };

  // Plan Management
  const createPlan = (name) => {
    const newPlanId = `plan_${Date.now()}`;
    setPlans(prev => {
      const updatedPlans = [...prev, { id: newPlanId, name, blocks: [] }];
      syncToCloud(updatedPlans, newPlanId);
      return updatedPlans;
    });
    setCurrentPlanId(newPlanId);
  };

  const renamePlan = (id, newName) => {
    setPlans(prev => {
      const updatedPlans = prev.map(p => p.id === id ? { ...p, name: newName } : p);
      syncToCloud(updatedPlans, currentPlanId);
      return updatedPlans;
    });
  };

  const deletePlan = (id) => {
    if (plans.length <= 1) {
      alert('최소 한 개의 플랜은 유지해야 합니다.');
      return;
    }
    setPlans(prev => {
      const updatedPlans = prev.filter(p => p.id !== id);
      if (currentPlanId === id) {
        setCurrentPlanId(updatedPlans[0].id);
        syncToCloud(updatedPlans, updatedPlans[0].id);
      } else {
        syncToCloud(updatedPlans, currentPlanId);
      }
      return updatedPlans;
    });
  };

  const toggleWeekend = () => {
    setSettings(prev => ({ ...prev, showWeekend: !prev.showWeekend }));
  };

  const addCategory = (newCategory) => {
    setCategories(prev => {
      const updated = { ...prev, [newCategory.id]: newCategory };
      syncToCloud(plans, currentPlanId, updated);
      return updated;
    });
  };

  const updateCategory = (categoryId, updatedFields) => {
    setCategories(prev => {
      if (!prev[categoryId]) return prev;
      const updated = { ...prev, [categoryId]: { ...prev[categoryId], ...updatedFields } };
      syncToCloud(plans, currentPlanId, updated);
      return updated;
    });
  };

  const deleteCategory = (categoryId) => {
    if (['class', 'self_study', 'routine', 'other'].includes(categoryId)) {
      alert("기본 카테고리는 삭제할 수 없습니다.");
      return;
    }
    setCategories(prev => {
      const updated = { ...prev };
      delete updated[categoryId];
      syncToCloud(plans, currentPlanId, updated);
      return updated;
    });
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

  const safePlans = Array.isArray(plans) && plans.length > 0 ? plans : [{ id: 'fallback', name: '기본 플랜', blocks: [] }];
  const currentPlan = safePlans.find(p => p.id === currentPlanId) || safePlans[0];
  const blocks = Array.isArray(currentPlan?.blocks) ? currentPlan.blocks : [];

  return {
    plans: safePlans,
    currentPlanId,
    setCurrentPlanId,
    createPlan,
    renamePlan,
    deletePlan,
    blocks,
    settings,
    user,
    firebaseStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addBlock,
    addBlocksBatch,
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
