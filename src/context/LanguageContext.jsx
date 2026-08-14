import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ko: {
    // Header & Brand
    brand_title: '주간 일정 플래너',
    my_schedule: '내 시간표',
    shared_schedule: '공유 시간표',
    dark_mode: '다크',
    light_mode: '라이트',
    login: '로그인',
    profile_settings: '프로필 설정',
    add_block: '새 블록 기입',
    quick_delete: '빠른 삭제',
    cancel: '취소',
    confirm_delete: '확인 (삭제)',
    weekday_5days: '월~금 5일만 보기',
    weekday_7days: '월~일 전체 보기',
    time_analytics: '시간 분석',
    backup_restore: '백업/복원',
    fullscreen: '전체화면',
    plan_rename: '이름변경',
    plan_add: '추가',
    plan_delete: '삭제',
    prompt_rename_plan: '플랜 이름 변경:',
    prompt_new_plan: '새 플랜 이름을 입력하세요:',
    confirm_delete_plan: '현재 플랜을 삭제하시겠습니까? (삭제 후 복구 불가)',
    selected_slots_count: '칸 선택됨',
    add_to_selected: '선택한 시간에 추가',
    today: 'TODAY',
    time_col: '시간',

    // Days of week
    days: {
      1: { short: '월', full: '월요일' },
      2: { short: '화', full: '화요일' },
      3: { short: '수', full: '수요일' },
      4: { short: '목', full: '목요일' },
      5: { short: '금', full: '금요일' },
      6: { short: '토', full: '토요일' },
      7: { short: '일', full: '일요일' }
    },

    // Categories
    cat_class: '고정 수업',
    cat_self_study: '자습',
    cat_routine: '운동',
    cat_other: '휴식',

    // Footer
    footer_guide: '플래너 사용 설명서',
    footer_github: '공식 페이지 / GitHub',
    footer_lang: '언어: 한국어',

    // Shared Space
    dashboard: '대시보드',
    dashboard_title: '공유 시간표 대시보드',
    my_rooms: '내 공유 방',
    explore_rooms: '탐색 (공개 방)',
    create_room: '새로운 방 만들기',
    join_with_code: '코드로 참여하기',
    tab_schedule: '시간표',
    tab_board: '게시판',
    room_settings: '방 설정',
    join_this_room: '이 방에 참여하기',
    members_count: '참여 멤버',
    all_members_heatmap: '전체 멤버 겹쳐보기',
    leave_room: '방 나가기',
    room_owner: '방장',
    room_me: '나',
    public: '공개',
    private: '비공개',
    copy_code: '복사',
    copied: '복사 완료!',
    all_members_schedule_desc: '모든 멤버의 공유된 일정이 함께 표시됩니다.',
    single_member_schedule_desc: '공유를 허용한 일정만 표시됩니다.',
    preview_mode_title: '미리보기 모드',
    preview_mode_desc: '시간표 및 게시판은 방에 참여한 멤버에게만 공개됩니다.\n방에 참여하면 모든 멤버의 공유 일정을 볼 수 있습니다.',
  },
  en: {
    // Header & Brand
    brand_title: 'Weekly Schedule Planner',
    my_schedule: 'My Schedule',
    shared_schedule: 'Shared Space',
    dark_mode: 'Dark',
    light_mode: 'Light',
    login: 'Log In',
    profile_settings: 'Profile',
    add_block: 'Add Block',
    quick_delete: 'Quick Delete',
    cancel: 'Cancel',
    confirm_delete: 'Confirm Delete',
    weekday_5days: 'Mon~Fri (5 Days)',
    weekday_7days: 'Mon~Sun (7 Days)',
    time_analytics: 'Time Analytics',
    backup_restore: 'Backup / Restore',
    fullscreen: 'Fullscreen',
    plan_rename: 'Rename',
    plan_add: 'Add Plan',
    plan_delete: 'Delete',
    prompt_rename_plan: 'Rename Plan:',
    prompt_new_plan: 'Enter new plan name:',
    confirm_delete_plan: 'Are you sure you want to delete this plan?',
    selected_slots_count: 'slots selected',
    add_to_selected: 'Add to Selected Time',
    today: 'TODAY',
    time_col: 'Time',

    // Days of week
    days: {
      1: { short: 'Mon', full: 'Monday' },
      2: { short: 'Tue', full: 'Tuesday' },
      3: { short: 'Wed', full: 'Wednesday' },
      4: { short: 'Thu', full: 'Thursday' },
      5: { short: 'Fri', full: 'Friday' },
      6: { short: 'Sat', full: 'Saturday' },
      7: { short: 'Sun', full: 'Sunday' }
    },

    // Categories
    cat_class: 'Class',
    cat_self_study: 'Self-Study',
    cat_routine: 'Workout',
    cat_other: 'Rest',

    // Footer
    footer_guide: 'User Guide',
    footer_github: 'Official / GitHub',
    footer_lang: 'Language: English',

    // Shared Space
    dashboard: 'Dashboard',
    dashboard_title: 'Shared Space Dashboard',
    my_rooms: 'My Rooms',
    explore_rooms: 'Explore (Public)',
    create_room: 'Create New Room',
    join_with_code: 'Join with Code',
    tab_schedule: 'Schedule',
    tab_board: 'Community',
    room_settings: 'Room Settings',
    join_this_room: 'Join This Room',
    members_count: 'Members',
    all_members_heatmap: 'All Members Heatmap',
    leave_room: 'Leave Room',
    room_owner: 'Owner',
    room_me: 'Me',
    public: 'Public',
    private: 'Private',
    copy_code: 'Copy',
    copied: 'Copied!',
    all_members_schedule_desc: 'All members shared schedules are combined into a heatmap.',
    single_member_schedule_desc: 'Only categories marked as public are displayed.',
    preview_mode_title: 'Preview Mode',
    preview_mode_desc: 'Full timetable and board are visible to room members.\nJoin this room to view all members shared schedules.',
  },
  zh: {
    // Header & Brand
    brand_title: '每周日程规划器',
    my_schedule: '我的时间表',
    shared_schedule: '共享时间表',
    dark_mode: '暗黑',
    light_mode: '明亮',
    login: '登录',
    profile_settings: '个人资料设置',
    add_block: '添加新日程',
    quick_delete: '快速删除',
    cancel: '取消',
    confirm_delete: '确认删除',
    weekday_5days: '仅周一~周五',
    weekday_7days: '显示整周 (周一~周日)',
    time_analytics: '时间分析',
    backup_restore: '备份 / 恢复',
    fullscreen: '全屏模式',
    plan_rename: '重命名',
    plan_add: '新建计划',
    plan_delete: '删除',
    prompt_rename_plan: '重命名当前计划:',
    prompt_new_plan: '输入新计划名称:',
    confirm_delete_plan: '确定要删除当前计划吗？(删除后无法恢复)',
    selected_slots_count: '已选时间段',
    add_to_selected: '添加到选定时段',
    today: '今天',
    time_col: '时间',

    // Days of week
    days: {
      1: { short: '一', full: '周一' },
      2: { short: '二', full: '周二' },
      3: { short: '三', full: '周三' },
      4: { short: '四', full: '周四' },
      5: { short: '五', full: '周五' },
      6: { short: '六', full: '周六' },
      7: { short: '日', full: '周日' }
    },

    // Categories
    cat_class: '固定课程',
    cat_self_study: '自习',
    cat_routine: '运动',
    cat_other: '休息',

    // Footer
    footer_guide: '使用说明书',
    footer_github: '官方页面 / GitHub',
    footer_lang: '语言: 简体中文',

    // Shared Space
    dashboard: '控制面板',
    dashboard_title: '共享空间面板',
    my_rooms: '我的共享房间',
    explore_rooms: '探索公开房间',
    create_room: '创建新房间',
    join_with_code: '邀请码加入',
    tab_schedule: '时间表',
    tab_board: '讨论区',
    room_settings: '房间设置',
    join_this_room: '加入此房间',
    members_count: '成员列表',
    all_members_heatmap: '全部成员热力图',
    leave_room: '退出房间',
    room_owner: '房主',
    room_me: '我',
    public: '公开',
    private: '私密',
    copy_code: '复制',
    copied: '复制成功!',
    all_members_schedule_desc: '汇集所有成员共享日程的热力图。',
    single_member_schedule_desc: '显示成员公开的时间表。',
    preview_mode_title: '预览模式',
    preview_mode_desc: '完整时间表和讨论区仅对房间成员开放。\n加入房间即可查看所有成员的共享日程。',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('planner_language');
    if (saved === 'en' || saved === 'ko' || saved === 'zh') return saved;
    if (navigator.language?.startsWith('zh')) return 'zh';
    return navigator.language?.startsWith('ko') ? 'ko' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('planner_language', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => {
      if (prev === 'ko') return 'en';
      if (prev === 'en') return 'zh';
      return 'ko';
    });
  };

  const t = (key) => {
    const dict = translations[lang] || translations.ko;
    return dict[key] || translations.ko[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'ko',
      setLang: () => {},
      toggleLanguage: () => {},
      t: (key) => translations.ko[key] || key
    };
  }
  return context;
}
