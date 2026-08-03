import React, { useState, useEffect } from 'react';
import { CATEGORIES, HIGHLIGHT_COLORS, DAYS_OF_WEEK } from '../constants/presets';
import { generate10MinStepOptions } from '../utils/timeUtils';
import { X, Trash2, Plus, Check, MapPin, AlignLeft } from 'lucide-react';

export function BlockModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialBlock,
  defaultDay = 1,
  defaultStartTime = '09:00'
}) {
  if (!isOpen) return null;

  const timeOptions = generate10MinStepOptions(6, 24);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('self_study');
  const [dayOfWeek, setDayOfWeek] = useState(defaultDay);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('#ffe600');
  const [location, setLocation] = useState('');
  const [isFixed, setIsFixed] = useState(true);
  const [memo, setMemo] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title || '');
      setCategory(initialBlock.category || 'self_study');
      setDayOfWeek(initialBlock.dayOfWeek || 1);
      setStartTime(initialBlock.startTime || '09:00');
      setEndTime(initialBlock.endTime || '10:00');
      setColor(initialBlock.color || '#ffe600');
      setLocation(initialBlock.location || '');
      setIsFixed(initialBlock.isFixed !== undefined ? initialBlock.isFixed : true);
      setMemo(initialBlock.memo || '');
      setSubtasks(initialBlock.subtasks || []);
    } else {
      setTitle('');
      setCategory('self_study');
      setDayOfWeek(defaultDay);
      setStartTime(defaultStartTime);
      // Auto set default end time to 1h 30m after start time
      const [h, m] = defaultStartTime.split(':').map(Number);
      const endH = Math.min(23, h + 1);
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      setColor(CATEGORIES.self_study.defaultColor);
      setLocation('');
      setIsFixed(true);
      setMemo('');
      setSubtasks([]);
    }
  }, [initialBlock, defaultDay, defaultStartTime, isOpen]);

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    if (CATEGORIES[catId]) {
      setColor(CATEGORIES[catId].defaultColor);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st_${Date.now()}`, text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (stId) => {
    setSubtasks(subtasks.map(st => st.id === stId ? { ...st, completed: !st.completed } : st));
  };

  const handleRemoveSubtask = (stId) => {
    setSubtasks(subtasks.filter(st => st.id !== stId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('블록 제목을 입력해 주세요.');
      return;
    }
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    onSave({
      ...(initialBlock ? { id: initialBlock.id } : {}),
      title: title.trim(),
      category,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      color,
      location: location.trim(),
      isFixed,
      memo: memo.trim(),
      subtasks
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialBlock ? '✏️ 일정 블록 수정' : '➕ 새 일정 블록 추가'}
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="block-form">
          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">블록 카테고리</label>
            <div className="category-grid">
              {Object.values(CATEGORIES).map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  className={`category-btn ${category === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">일정 / 과목 / 자습 제목 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="예: 알고리즘 자습, 컴퓨터구조 수업, 헬스장"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Day of Week */}
          <div className="form-group">
            <label className="form-label">요일 선택</label>
            <div className="days-selector">
              {DAYS_OF_WEEK.map(d => (
                <button
                  type="button"
                  key={d.id}
                  className={`day-btn ${Number(dayOfWeek) === d.id ? 'active' : ''}`}
                  onClick={() => setDayOfWeek(d.id)}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          {/* 10-Minute Precision Time Selection */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">시작 시간 (10분 단위)</label>
              <select
                className="select-field"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              >
                {timeOptions.map(t => (
                  <option key={`start_${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label className="form-label">종료 시간 (10분 단위)</label>
              <select
                className="select-field"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              >
                {timeOptions.map(t => (
                  <option key={`end_${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Highlighter Color Picker */}
          <div className="form-group">
            <label className="form-label">형광 펜 하이라이트 색상</label>
            <div className="color-palette">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  type="button"
                  key={c.hex}
                  className={`color-circle ${color === c.hex ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                >
                  {color === c.hex && <Check size={14} className="color-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Fixed Toggle */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">장소 (선택)</label>
              <div className="input-icon-wrapper">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  className="input-field with-icon"
                  placeholder="예: 공학관 301호, 중앙도서관"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group half checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={e => setIsFixed(e.target.checked)}
                />
                <span>매주 고정 반복 일정</span>
              </label>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="form-group">
            <label className="form-label">자습/달성 하위 세부 과제 (Checklist)</label>
            <div className="subtasks-list">
              {subtasks.map(st => (
                <div key={st.id} className="subtask-row">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                  />
                  <span className={`subtask-text ${st.completed ? 'completed' : ''}`}>
                    {st.text}
                  </span>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => handleRemoveSubtask(st.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="subtask-add-row">
              <input
                type="text"
                className="input-field"
                placeholder="새 체크리스트 항목 입력 (예: 백준 2문제 풀기)"
                value={newSubtaskText}
                onChange={e => setNewSubtaskText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button type="button" className="btn btn-sm" onClick={handleAddSubtask}>
                <Plus size={14} /> 추가
              </button>
            </div>
          </div>

          {/* Memo */}
          <div className="form-group">
            <label className="form-label">메모 / 참고사항</label>
            <div className="input-icon-wrapper">
              <textarea
                className="textarea-field"
                rows={2}
                placeholder="특이사항, 시험 범위, 준비물 등 메모"
                value={memo}
                onChange={e => setMemo(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            {initialBlock && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (confirm('이 일정 블록을 삭제하시겠습니까?')) {
                    onDelete(initialBlock.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={16} /> 삭제
              </button>
            )}

            <div className="right-actions">
              <button type="button" className="btn" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                {initialBlock ? '수정 완료' : '블록 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
