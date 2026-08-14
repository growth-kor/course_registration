import React, { useState, useEffect } from 'react';
import { CATEGORIES, HIGHLIGHT_COLORS, DAYS_OF_WEEK, PRESET_EMOJIS } from '../constants/presets';
import { generate10MinStepOptions, formatTimeLabel } from '../utils/timeUtils';
import { X, Trash2, Plus, Check, MapPin, AlignLeft, Lock, Globe } from 'lucide-react';

export function BlockModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSave,
  onDelete,
  initialBlock,
  initialTimeSlots = []
}) {
  if (!isOpen) return null;

  const timeOptions = generate10MinStepOptions(6, 30);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('self_study');
  const [timeSlots, setTimeSlots] = useState([]);
  const [color, setColor] = useState('#ffe600');
  const [location, setLocation] = useState('');
  const [showLocation, setShowLocation] = useState(true);
  const [memo, setMemo] = useState('');
  const [showMemo, setShowMemo] = useState(true);
  const [subtasks, setSubtasks] = useState([]);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title || '');
      setCategory(initialBlock.category || 'self_study');
      setTimeSlots(initialBlock.timeSlots || []);
      setColor(initialBlock.color || '#ffe600');
      setLocation(initialBlock.location || '');
      setShowLocation(initialBlock.showLocation !== false);
      setMemo(initialBlock.memo || '');
      setShowMemo(initialBlock.showMemo !== false);
      setSubtasks(initialBlock.subtasks || []);
      setShowSubtasks(initialBlock.showSubtasks !== false);
    } else {
      setTitle('');
      setCategory('self_study');
      setTimeSlots(initialTimeSlots && initialTimeSlots.length > 0 ? initialTimeSlots : [{ id: `ts_${Date.now()}`, dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }]);
      setColor(categories && categories.self_study ? categories.self_study.defaultColor : '#ffe600');
      setLocation('');
      setShowLocation(true);
      setMemo('');
      setShowMemo(true);
      setSubtasks([]);
      setShowSubtasks(true);
    }
  }, [initialBlock, initialTimeSlots, isOpen, categories]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAddCategorySubmit = () => {
    if (!newCatLabel.trim()) return;
    const newId = `cat_${Date.now()}`;
    const defaultGray = '#cbd5e1';
    
    onAddCategory({
      id: newId,
      label: newCatLabel.trim(),
      icon: newCatIcon || '✨',
      defaultColor: defaultGray,
      isShared: true
    });
    setIsAddingCategory(false);
    setNewCatLabel('');
    setCategory(newId);
    setColor(defaultGray);
  };

  const updateTimeSlot = (id, field, value) => {
    setTimeSlots(slots => slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeTimeSlot = (id) => {
    setTimeSlots(slots => slots.filter(s => s.id !== id));
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    if (categories && categories[catId]) {
      setColor(categories[catId].defaultColor);
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
    if (timeSlots.length === 0) {
      alert('최소 하나의 시간대를 설정해 주세요.');
      return;
    }
    
    for (const slot of timeSlots) {
      if (slot.startTime >= slot.endTime) {
        alert('모든 시간대의 종료 시간은 시작 시간보다 이후여야 합니다.');
        return;
      }
    }

    const blockData = {
      id: initialBlock ? initialBlock.id : null,
      title: title.trim(),
      category,
      color,
      timeSlots,
      location: location.trim(),
      showLocation,
      memo: memo.trim(),
      showMemo,
      subtasks,
      showSubtasks
    };

    onSave(blockData);

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
              {categories && Object.values(categories).map(cat => (
                <div key={cat.id} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={`category-btn ${category === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>
                  {!['class', 'self_study', 'routine', 'other'].includes(cat.id) && (
                    <button
                      type="button"
                      className="category-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`'${cat.label}' 카테고리를 삭제하시겠습니까? (이 카테고리를 사용하는 기존 일정은 '기타'로 변경됩니다)`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              
              {!isAddingCategory ? (
                <button
                  type="button"
                  className="category-btn add-new-cat"
                  onClick={() => setIsAddingCategory(true)}
                  style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}
                >
                  <Plus size={16} style={{ marginRight: '4px' }} /> 카테고리 추가
                </button>
              ) : (
                <div className="new-category-form">
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem', position: 'relative' }}>
                    <button
                      type="button"
                      className="input-field"
                      style={{ width: '40px', padding: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'white' }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      {newCatIcon}
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-picker-dropdown">
                        {PRESET_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="emoji-btn"
                            onClick={() => {
                              setNewCatIcon(emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    <input 
                      type="text" 
                      placeholder="카테고리 이름" 
                      value={newCatLabel} 
                      onChange={e => setNewCatLabel(e.target.value)} 
                      className="input-field"
                      style={{ flex: 1 }}
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" className="btn btn-sm" onClick={() => setIsAddingCategory(false)}><X size={14} /></button>
                      <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCategorySubmit} disabled={!newCatLabel.trim()}><Check size={14} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">일정 제목 *</label>
            <input
              type="text"
              className="input-field"
              placeholder=""
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Time Slots */}
          <div className="form-group">
            <label className="form-label">요일 및 시간대 설정</label>
            <div className="time-slots-list">
              {timeSlots.map(slot => (
                <div key={slot.id} className="time-slot-row-ui">
                  <select
                    className="select-field sm"
                    value={slot.dayOfWeek}
                    onChange={e => updateTimeSlot(slot.id, 'dayOfWeek', Number(e.target.value))}
                  >
                    {DAYS_OF_WEEK.map(d => <option key={d.id} value={d.id}>{d.short}</option>)}
                  </select>
                  <select
                    className="select-field sm"
                    value={slot.startTime}
                    onChange={e => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                  >
                    {timeOptions.map(t => <option key={`s_${t}`} value={t}>{formatTimeLabel(...t.split(':').map(Number))}</option>)}
                  </select>
                  <span className="time-separator">~</span>
                  <select
                    className="select-field sm"
                    value={slot.endTime}
                    onChange={e => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                  >
                    {timeOptions.map(t => <option key={`e_${t}`} value={t}>{formatTimeLabel(...t.split(':').map(Number))}</option>)}
                  </select>
                  <button type="button" className="btn-icon-danger" onClick={() => removeTimeSlot(slot.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline margin-top"
              onClick={() => {
                const last = timeSlots[timeSlots.length - 1];
                let nextStart = last ? last.endTime : '09:00';
                let nextEnd = last ? last.endTime : '10:00';
                // Try to add 1 hour
                const h = parseInt(nextEnd.split(':')[0], 10);
                if (h < 23) nextEnd = `${String(h+1).padStart(2, '0')}:${nextEnd.split(':')[1]}`;
                setTimeSlots([...timeSlots, { id: `ts_${Date.now()}_${Math.random()}`, dayOfWeek: last ? last.dayOfWeek : 1, startTime: nextStart, endTime: nextEnd }]);
              }}
            >
              <Plus size={14} /> 시간대 추가
            </button>
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
              {/* Custom Color Picker */}
              <label 
                className={`color-circle custom-color-btn ${!HIGHLIGHT_COLORS.some(c => c.hex === color) ? 'selected' : ''}`}
                style={{ backgroundColor: !HIGHLIGHT_COLORS.some(c => c.hex === color) ? color : '#ffffff' }}
                title="사용자 지정 색상"
              >
                {!HIGHLIGHT_COLORS.some(c => c.hex === color) ? (
                  <Check size={14} className="color-check" />
                ) : (
                  <Plus size={14} style={{ color: 'var(--border-main)' }} />
                )}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                />
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>장소 (선택)</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.7rem' }}>
                <input type="checkbox" checked={showLocation} onChange={e => setShowLocation(e.target.checked)} /> 달력에 표시
              </label>
            </label>
            <div className="input-icon-wrapper">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                className="input-field with-icon"
                placeholder=""
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>세부 과제</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.7rem' }}>
                <input type="checkbox" checked={showSubtasks} onChange={e => setShowSubtasks(e.target.checked)} /> 달력에 표시
              </label>
            </label>
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
                placeholder=""
                value={newSubtaskText}
                onChange={e => setNewSubtaskText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!e.nativeEvent.isComposing) {
                      handleAddSubtask();
                    }
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
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>메모 / 참고사항</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.7rem' }}>
                <input type="checkbox" checked={showMemo} onChange={e => setShowMemo(e.target.checked)} /> 달력에 표시
              </label>
            </label>
            <div className="input-icon-wrapper">
              <textarea
                className="textarea-field"
                rows={2}
                placeholder=""
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
