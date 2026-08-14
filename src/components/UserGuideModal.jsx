import React, { useState } from 'react';
import { 
  X, BookOpen, MousePointer, Keyboard, BarChart2, Users, 
  Settings, CheckCircle2, Clock, Globe, Lock, Share2, 
  Trash2, Plus, Calendar, Layers, Download, Sparkles, Moon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function UserGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = lang === 'en' ? [
    { id: 'basic', label: 'Basic Guide', icon: <BookOpen size={16} /> },
    { id: 'shortcuts', label: 'Shortcuts & Gestures', icon: <Keyboard size={16} /> },
    { id: 'analytics', label: 'Time Analytics', icon: <BarChart2 size={16} /> },
    { id: 'shared', label: 'Shared Space', icon: <Users size={16} /> },
    { id: 'settings', label: 'Backup / Theme / Tips', icon: <Settings size={16} /> },
  ] : (lang === 'zh' ? [
    { id: 'basic', label: '基础使用指南', icon: <BookOpen size={16} /> },
    { id: 'shortcuts', label: '快捷键与手势', icon: <Keyboard size={16} /> },
    { id: 'analytics', label: '时间分析与统计', icon: <BarChart2 size={16} /> },
    { id: 'shared', label: '共享空间', icon: <Users size={16} /> },
    { id: 'settings', label: '备份 / 主题 / 技巧', icon: <Settings size={16} /> },
  ] : [
    { id: 'basic', label: '기본 사용법', icon: <BookOpen size={16} /> },
    { id: 'shortcuts', label: '단축키 & 제스처', icon: <Keyboard size={16} /> },
    { id: 'analytics', label: '시간 분석 & 통계', icon: <BarChart2 size={16} /> },
    { id: 'shared', label: '공유 시간표 (스페이스)', icon: <Users size={16} /> },
    { id: 'settings', label: '백업 / 테마 / 팁', icon: <Settings size={16} /> },
  ]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '840px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-main, #ffffff)',
          border: '3px solid var(--border-main)',
          boxShadow: 'var(--shadow-hard, 6px 6px 0px #000000)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '2px solid var(--border-main)',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.35rem', color: 'var(--text-main)' }}>
              {lang === 'en' ? 'Weekly Schedule Planner User Guide' : (lang === 'zh' ? '每周日程规划器使用说明书' : '주간 일정 플래너 사용 설명서')}
            </h2>
          </div>
          <button 
            className="btn btn-sm"
            onClick={onClose}
            style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={lang === 'en' ? "Close (Esc)" : (lang === 'zh' ? "关闭 (Esc)" : "닫기 (Esc)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-main)',
          backgroundColor: '#f8fafc',
          overflowX: 'auto',
          padding: '0.5rem 1rem 0 1rem',
          gap: '0.4rem'
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  border: '2px solid var(--border-main)',
                  borderBottom: isActive ? '2px solid white' : '2px solid var(--border-main)',
                  backgroundColor: isActive ? 'white' : '#e2e8f0',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  marginBottom: isActive ? '-2px' : '0',
                  transform: isActive ? 'none' : 'translateY(2px)',
                  boxShadow: isActive ? 'none' : 'var(--shadow-hard-sm, 2px 2px 0px #000)',
                  transition: 'all 0.1s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body - Tab Contents */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          backgroundColor: 'white'
        }}>
          
          {/* TAB 1: 기본 사용법 */}
          {activeTab === 'basic' && (
            lang === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 1. Creating Schedule Blocks (2 Methods)
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Drag & Click empty slots</strong>: Click or drag over empty slots on the grid, then click <code>[Add to Selected Time]</code> in the bottom floating bar.</li>
                    <li><strong>[+ Add Block] button</strong>: Click the button in the top toolbar to manually pick days and times.</li>
                    <li><strong>Multiple days/slots</strong>: A single course/routine can hold multiple different time slots across different days.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} /> 2. Category Management
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Categories</strong>: Organize tasks into Class, Self-Study, Workout, Rest, or create custom categories with tailored colors and icons.</li>
                    <li><strong>Color & Icon Highlights</strong>: Customize each category with vibrant neon highlighter palettes.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 3. Multiple Plans (Plan A/B) & Extended Night Hours
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Multiple Plans</strong>: Manage alternative timetables using the top plan selector dropdown (Add, Rename, Delete).</li>
                    <li><strong>Next-Day 06:00 (06:00 ~ 30:00)</strong>: Full 24-hour+ support extending into late night/dawn hours for night owls.</li>
                  </ul>
                </div>
              </div>
            ) : (lang === 'zh' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 1. 添加日程块 (2种方式)
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>鼠标拖拽与点击</strong>: 在时间表网格的空白区域拖动或点击多个时段，然后点击底部浮动条中的 <code>[添加到选定时段]</code>。</li>
                    <li><strong>[+ 添加新日程] 按钮</strong>: 点击顶部工具栏按钮，手动选择星期与时间范围进行添加。</li>
                    <li><strong>多星期 / 多时段支持</strong>: 一个课程或日程可在不同日期添加多个不同的时间段。</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} /> 2. 分类管理
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>分类管理</strong>: 包含固定课程、自习、运动、休息，并支持自由创建自定义分类与荧光配色。</li>
                    <li><strong>醒目高亮</strong>: 自由设置各分类的图标与高对比度荧光色。</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 3. 多重计划 (方案 A/B) 与通宵时间支持
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>多计划管理</strong>: 通过顶部计划下拉菜单添加(A/B方案)、重命名或删除计划。</li>
                    <li><strong>次日凌晨6点支持 (06:00 ~ 次日 06:00)</strong>: 为夜猫子提供跨越深夜至次日清晨的完整时间段支持。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 1. 일정 블록 추가하기 (2가지 방법)
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>마우스 드래그 & 클릭</strong>: 시간표 위의 빈 칸을 원하는 만큼 드래그하거나 여러 칸 클릭한 뒤 하단 <code>[선택한 시간에 추가]</code> 버튼을 누르면 해당 시간이 자동 기입됩니다.</li>
                    <li><strong>새 블록 기입 버튼</strong>: 상단 제어바의 <code>[+ 새 블록 기입]</code> 버튼을 눌러 요일과 시간을 직접 지정하여 등록할 수 있습니다.</li>
                    <li><strong>다중 요일 / 다중 시간 지원</strong>: 하나의 과목/일정 안에 월/수/금 등 서로 다른 시간대 슬롯을 여러 개 추가할 수 있습니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} /> 2. 카테고리 관리
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>카테고리 분류</strong>: 수업(과목), 자습/공부, 루틴, 기타 및 나만의 커스텀 카테고리를 자유롭게 생성하고 색상을 부여할 수 있습니다.</li>
                    <li><strong>직관적인 하이라이트</strong>: 고대비 네온 형광펜 색상과 아이콘으로 시간표를 직관적으로 구분할 수 있습니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 3. 다중 플랜(시간표 A/B안) 및 확장 시간 지원
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>플랜 관리</strong>: 상단 드롭다운에서 플랜을 추가(A안, B안 등)하거나 이름을 변경/삭제하여 상황별 시간표를 복수로 관리할 수 있습니다.</li>
                    <li><strong>익일 새벽 6시까지(06:00 ~ 익일 06:00)</strong>: 올빼미형 학습자 및 심야 일정을 위해 24시 이후 익일 새벽 시간대까지 빈틈없이 지원합니다.</li>
                  </ul>
                </div>
              </div>
            ))
          )}

          {/* TAB 2: 단축키 & 제스처 */}
          {activeTab === 'shortcuts' && (
            lang === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Keyboard size={18} /> Keyboard Shortcuts
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Toggle Fullscreen</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>F</kbd>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Close Modal / Dialog</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>Esc</kbd>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MousePointer size={18} /> Mouse Gestures & Quick Delete
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Click & Drag selection</strong>: Click and drag across the timetable grid to highlight multiple continuous slots.</li>
                    <li><strong>Single click on block</strong>: Opens the block edit dialog for detailed notes, checklist subtasks, and color updates.</li>
                    <li><strong>Quick Delete mode</strong>: Click <code>[Quick Delete]</code> in the header, click blocks to mark them for deletion, and click <code>[Confirm Delete]</code> to batch delete.</li>
                  </ul>
                </div>
              </div>
            ) : (lang === 'zh' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Keyboard size={18} /> 键盘快捷键
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>全屏切换</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>F</kbd>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>关闭窗口 / 弹窗</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>Esc</kbd>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MousePointer size={18} /> 鼠标手势与快捷编辑
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>连续拖拽选择</strong>: 按住鼠标左键在时间表区域拖动，可一次性选中连续的空白时间段。</li>
                    <li><strong>单击日程块</strong>: 单击已添加的日程块即可打开编辑弹窗，修改详细备注、子任务清单或颜色。</li>
                    <li><strong>快速删除模式</strong>: 点击顶部 <code>[快速删除]</code> 进入删除模式，连续点击想要删除的块后点击 <code>[确认删除]</code> 即可批量清理。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Keyboard size={18} /> 키보드 단축키
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>전체화면 토글</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>F</kbd>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'white', border: '1.5px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>모달 / 팝업 닫기</span>
                      <kbd style={{ padding: '0.2rem 0.6rem', border: '2px solid var(--border-main)', background: '#f1f5f9', fontWeight: '900', boxShadow: '1px 1px 0 #000' }}>Esc</kbd>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MousePointer size={18} /> 마우스 제스처 & 빠른 편집
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>연속 드래그 선택</strong>: 마우스 좌클릭을 누른 채 시간표 영역을 드래그하면 원하는 범위의 연속된 빈 시간 슬롯이 한 번에 하이라이트됩니다.</li>
                    <li><strong>블록 단일 클릭</strong>: 등록된 시간표 블록을 클릭하면 즉시 편집 창이 열리며 세부 정보 수정 또는 삭제를 진행할 수 있습니다.</li>
                    <li><strong>빠른 삭제 모드</strong>: 상단 <code>[빠른 삭제]</code> 버튼을 누르면 삭제 모드로 진입하며, 지우고자 하는 블록들을 연속 클릭한 뒤 <code>[확인 (삭제)]</code>를 눌러 일괄 정리할 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            ))
          )}

          {/* TAB 3: 시간 분석 & 통계 */}
          {activeTab === 'analytics' && (
            lang === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={18} /> 1. Real-time Quick Stats Bar
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.6', fontSize: '0.92rem' }}>
                    As you edit your schedule, total hours per category (e.g. Class 18h, Self-Study 24h) are instantly updated on the top status bar.
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> 2. In-depth Time Analytics Dialog
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>Click <code>[Time Analytics]</code> in the header to view weekly total immersion hours, category breakdown charts, and daily distributions.</li>
                    <li>Identify wasted time slots and balance your study/work routine effectively.</li>
                  </ul>
                </div>
              </div>
            ) : (lang === 'zh' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={18} /> 1. 顶部实时统计栏 (Quick Stats)
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.6', fontSize: '0.92rem' }}>
                    在编辑时间表时，顶部状态栏会实时汇总并显示各类别的每周总耗时(例如：固定课程 18h，自习 24h 等)。
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> 2. 深度时间分析弹窗
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>点击顶部控制栏的 <code>[时间分析]</code> 按钮，可直观查看每周总投入时间、分类占比图表及每日时间分布。</li>
                    <li>有助于找出被浪费的零碎时间，平衡学习与生活作息。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={18} /> 1. 상단 실시간 통계 바 (Quick Stats)
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.6', fontSize: '0.92rem' }}>
                    시간표를 편집하는 즉시 상단 바에 카테고리별 주간 총 소요 시간(예: 수업 18h, 자습 24h 등)이 실시간으로 합산되어 표시됩니다.
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> 2. 심층 시간 분석 모달
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>상단 제어바의 <code>[시간 분석]</code> 버튼을 클릭하면 주간 총 몰입 시간, 카테고리별 비율 차트 및 일자별 시간 분포를 시각적으로 분석할 수 있습니다.</li>
                    <li>불필요하게 낭비되는 자투리 시간이나 과도하게 치우친 학습/활동 밸런스를 점검하는 데 유용합니다.</li>
                  </ul>
                </div>
              </div>
            ))
          )}

          {/* TAB 4: 공유 시간표 (스페이스) */}
          {activeTab === 'shared' && (
            lang === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> 1. My Rooms, Explore & Join via Code
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>My Rooms & Explore</strong>: View your joined rooms under <code>[My Rooms]</code> or browse public rooms under <code>[Explore]</code>.</li>
                    <li><strong>Public Room Browsing</strong>: Explore schedules and community boards without joining if the room allows guest viewing.</li>
                    <li><strong>6-digit Code</strong>: Copy and share the 6-character code with your team for instant joining.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 2. Room-specific Shared Plan Selection & Heatmap
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>[Set Shared Schedule]</strong>: Click the button in the room to pick which timetable plan (e.g. Plan A or B) you want to share with this room.</li>
                    <li><strong>[All Members Heatmap]</strong>: Overlays everyone's schedule to immediately discover mutual free slots for meetings.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={18} /> 3. Room Settings, Member Management & Board
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Room Settings</strong>: Room owners can update room name, description, cover image, and toggle guest viewing permissions.</li>
                    <li><strong>Member Management</strong>: Room owners can transfer ownership or kick members inside Room Settings.</li>
                    <li><strong>Community Board</strong>: Post announcements, ask questions, upload photos, leave nested comments, and conduct live polls.</li>
                  </ul>
                </div>
              </div>
            ) : (lang === 'zh' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> 1. 我的所属房间、探索与邀请码加入
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>所属房间与探索</strong>: 在 <code>[我的所属房间]</code> 中管理已加入的房间，或通过 <code>[探索]</code> 浏览公开房间。</li>
                    <li><strong>公开房间自由浏览</strong>: 若房间开启访客查看权限，无需加入即可自由查看成员时间表与讨论区。</li>
                    <li><strong>6位邀请码</strong>: 复制6位邀请码快速分享给好友或队友即可一键加入。</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 2. 房间公开时间表设置与热力图
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>[设置公开时间表]</strong>: 点击房间工具栏中的按钮，可自由指定要在该房间展示的个人计划(方案A或B等)。</li>
                    <li><strong>[全部成员热力图]</strong>: 将所有成员的时间表重叠汇聚，即刻找出共同空闲的开会与学习时间段。</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={18} /> 3. 房间设置、成员管理与讨论区
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>房间设置</strong>: 房主可修改房间名称、介绍、封面图片以及是否允许访客浏览时间表。</li>
                    <li><strong>成员管理</strong>: 房主可在房间设置中的成员管理标签下进行转让房主或踢出成员。</li>
                    <li><strong>讨论区</strong>: 支持发布公告、交流讨论、上传图片、回复评论与实时投票。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> 1. 내 소속 방, 탐색 & 초대 코드 참여
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>내 소속 방 & 탐색</strong>: 내가 속한 방을 <code>[내 소속 방]</code>에서 확인하고, <code>[탐색]</code> 탭에서 공개된 방들을 자유롭게 찾아볼 수 있습니다.</li>
                    <li><strong>공개 방 둘러보기</strong>: 방 설정에 따라 가입하지 않고도 내부 시간표와 게시판을 미리 둘러볼 수 있습니다.</li>
                    <li><strong>6자리 초대 코드</strong>: 코드를 복사해 친구들에게 전달하면 비공개 방도 손쉽게 입장할 수 있습니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 2. 방별 공개 시간표 설정 & 실시간 히트맵
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>[공개 시간표 설정]</strong>: 방 내부의 버튼을 눌러 각 방마다 공개할 내 시간표 플랜(A안, B안 등)을 체크표시로 개별 지정할 수 있습니다.</li>
                    <li><strong>[전체 멤버 겹쳐보기]</strong>: 모든 팀원의 일정이 하나로 중첩되어 <strong>모두가 비어 있는 공동 회의/스터디 시간대</strong>를 즉각 발견할 수 있습니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={18} /> 3. 방 설정, 멤버 관리 & 커뮤니티 게시판
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>방 설정</strong>: 방장은 방 이름, 소개글, 대표 이미지, 비회원 열람 허용 여부를 설정할 수 있습니다.</li>
                    <li><strong>멤버 관리</strong>: 방 설정 모달 내 <code>[멤버 관리]</code> 탭에서 방장 권한 위임 및 멤버 강퇴가 가능합니다.</li>
                    <li><strong>게시판</strong>: 카테고리별 공지, 자유 글 작성, 사진 첨부, 댓글 및 대댓글, 실시간 투표 기능을 통해 팀원들과 활발히 소통할 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            ))
          )}

          {/* TAB 5: 백업 / 테마 / 팁 */}
          {activeTab === 'settings' && (
            lang === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> 1. Safe JSON Backup & Restore
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>Export your entire timetable as a JSON file via <code>[Backup / Restore]</code> to keep a safe offline copy.</li>
                    <li>Paste or import JSON on any browser/device to restore your schedule instantly.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Moon size={18} /> 2. Dark Mode & 10-char Status Message
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>Dark Theme</strong>: Click the <code>[Dark/Light]</code> button in the header for high-contrast dark mode.</li>
                    <li><strong>10-char Status Message</strong>: Set your status message in Profile settings to stand out in member lists.</li>
                  </ul>
                </div>

                <div style={{ padding: '0.9rem 1.1rem', backgroundColor: '#fffbeb', border: '2px solid #b45309', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: '1.5' }}>
                    <strong>Tip</strong>: Shared Space requires a Google login, while personal schedules work completely offline in your browser local storage without login.
                  </div>
                </div>
              </div>
            ) : (lang === 'zh' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> 1. 安全数据备份与 JSON 恢复
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>通过顶部的 <code>[备份 / 恢复]</code> 将全部时间表导出为 JSON 文件保存在本地。</li>
                    <li>在任何浏览器或设备上粘贴或导入 JSON 文件即可1秒恢复完整时间表。</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Moon size={18} /> 2. 暗黑模式与个人状态签名
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>暗黑模式</strong>: 点击标题旁的 <code>[暗黑/明亮]</code> 按钮即可切换为舒适的高对比度暗黑主题。</li>
                    <li><strong>10字状态签名</strong>: 在个人资料中设置最多10字的状态签名，在成员列表中生动展示。</li>
                  </ul>
                </div>

                <div style={{ padding: '0.9rem 1.1rem', backgroundColor: '#fffbeb', border: '2px solid #b45309', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: '1.5' }}>
                    <strong>提示</strong>: 共享时间表需登录 Google 账号，而个人时间表无需登录即可完全离线保存在本地浏览器中。
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> 1. 안전한 데이터 백업 & JSON 가져오기
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li>상단의 <code>[백업/복원]</code> 메뉴를 통해 내 전체 시간표를 JSON 파일로 다운로드하여 로컬에 안전하게 보관할 수 있습니다.</li>
                    <li>다른 기기나 브라우저에서 JSON 데이터를 붙여넣거나 파일을 불러와 1초 만에 시간표를 복구할 수 있습니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Moon size={18} /> 2. 다크 모드 & 프로필 상태 메시지
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                    <li><strong>다크 모드</strong>: 제목 오른쪽의 <code>[다크/라이트]</code> 버튼을 눌러 눈이 편안한 고대비 다크 테마로 전환할 수 있습니다.</li>
                    <li><strong>프로필 10자 상태 메시지</strong>: 우측 상단 프로필 버튼을 눌러 닉네임과 함께 최대 10자의 상태 메시지(예: '성장하는 사람', '열공 중')를 설정하면 공유방 멤버 목록에 돋보이게 표시됩니다.</li>
                  </ul>
                </div>

                <div style={{ padding: '0.9rem 1.1rem', backgroundColor: '#fffbeb', border: '2px solid #b45309', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: '1.5' }}>
                    <strong>Tip</strong>: 공유 시간표 기능은 Google 계정 로그인이 필요하며, 개인 시간표는 로그인 없이도 브라우저 로컬 저장소에 완벽히 보관됩니다.
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '2px solid var(--border-main)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 'bold' }}>
            GROWTH-KOR · {lang === 'en' ? 'Weekly Schedule Planner v1.0' : (lang === 'zh' ? '每周日程规划器 v1.0' : '주간 일정 플래너 v1.0')}
          </span>
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '0.5rem 1.5rem', fontWeight: '900' }}
          >
            {lang === 'en' ? 'Got It' : (lang === 'zh' ? '我知道了' : '확인했습니다')}
          </button>
        </div>
      </div>
    </div>
  );
}
