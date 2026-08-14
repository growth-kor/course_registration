import React, { useState } from 'react';
import { 
  X, BookOpen, MousePointer, Keyboard, BarChart2, Users, 
  Settings, CheckCircle2, Clock, Globe, Lock, Share2, 
  Trash2, Plus, Calendar, Layers, Download, Sparkles, Moon
} from 'lucide-react';

export function UserGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: '기본 사용법', icon: <BookOpen size={16} /> },
    { id: 'shortcuts', label: '단축키 & 제스처', icon: <Keyboard size={16} /> },
    { id: 'analytics', label: '시간 분석 & 통계', icon: <BarChart2 size={16} /> },
    { id: 'shared', label: '공유 시간표 (스페이스)', icon: <Users size={16} /> },
    { id: 'settings', label: '백업 / 테마 / 팁', icon: <Settings size={16} /> },
  ];

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
              주간 일정 플래너 사용 설명서
            </h2>
          </div>
          <button 
            className="btn btn-sm"
            onClick={onClose}
            style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="닫기 (Esc)"
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
                  <Layers size={18} /> 2. 카테고리 관리 & 공개 여부 설정
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                  <li><strong>카테고리 분류</strong>: 수업(과목), 자습/공부, 루틴, 기타 및 나만의 커스텀 카테고리를 자유롭게 생성하고 색상을 부여할 수 있습니다.</li>
                  <li><strong>공개(🌐) / 비공개(🔒) 토글</strong>: 블록 모달에서 카테고리 좌측 상단의 지구본/자물쇠 아이콘을 클릭하여 <strong>공유방에 내보낼 카테고리와 나만 볼 카테고리</strong>를 세밀하게 분리할 수 있습니다.</li>
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
          )}

          {/* TAB 2: 단축키 & 제스처 */}
          {activeTab === 'shortcuts' && (
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
          )}

          {/* TAB 3: 시간 분석 & 통계 */}
          {activeTab === 'analytics' && (
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
          )}

          {/* TAB 4: 공유 시간표 (스페이스) */}
          {activeTab === 'shared' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} /> 1. 방 생성 & 초대 코드 참여
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                  <li><strong>공개/비공개 방 생성</strong>: 스터디 그룹, 동아리, 팀 프로젝트용 공유 스페이스를 만들 수 있습니다.</li>
                  <li><strong>6자리 초대 코드</strong>: 코드를 복사해 친구들에게 전달하면 비공개 방도 손쉽게 입장할 수 있습니다.</li>
                  <li><strong>탐색 탭 (미리보기 모드)</strong>: 공개 방의 경우 가입하지 않고도 내부 활동과 인원수를 미리 둘러보고 참여를 결정할 수 있습니다.</li>
                </ul>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '2px solid var(--border-main)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Share2 size={18} /> 2. 실시간 시간표 히트맵 (전체 멤버 겹쳐보기)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                  <li><code>[전체 멤버 겹쳐보기]</code>를 누르면 모든 팀원의 일정이 하나로 중첩되어 <strong>모두가 비어 있는 공동 회의/스터디 시간대</strong>를 즉각 발견할 수 있습니다.</li>
                  <li>좌측 참여 멤버 목록에서 특정 멤버를 클릭하여 해당 팀원의 개별 공개 시간표를 확인할 수 있습니다.</li>
                </ul>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', border: '2px solid var(--border-main)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} /> 3. 방장 설정 & 커뮤니티 게시판
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.92rem' }}>
                  <li><strong>방 설정</strong>: 방장은 방 이름, 소개글, 대표 이미지(자동 압축 파일 업로드 또는 이미지 URL)를 언제든 수정할 수 있습니다.</li>
                  <li><strong>게시판</strong>: 카테고리별 공지, 자유 글 작성, 사진 첨부, 댓글 및 대댓글, 실시간 투표 기능을 통해 팀원들과 활발히 소통할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: 백업 / 테마 / 팁 */}
          {activeTab === 'settings' && (
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
            GROWTH-KOR · 주간 일정 플래너 v1.0
          </span>
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '0.5rem 1.5rem', fontWeight: '900' }}
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
