import React from 'react';
import { CATEGORIES } from '../constants/presets';
import { formatDurationText } from '../utils/timeUtils';
import { CheckSquare, MapPin, Repeat } from 'lucide-react';

export function BlockItem({ block, style, onClick }) {
  const categoryInfo = CATEGORIES[block.category] || CATEGORIES.other;

  const totalSubtasks = block.subtasks?.length || 0;
  const completedSubtasks = block.subtasks?.filter(st => st.completed).length || 0;

  return (
    <div
      className="block-item"
      style={{
        ...style,
        backgroundColor: block.color || categoryInfo.defaultColor
      }}
      onClick={() => onClick(block)}
      title={`${block.title} (${block.startTime} ~ ${block.endTime})`}
    >
      <div className="block-header">
        <span className="block-icon">{categoryInfo.icon}</span>
        <span className="block-title">{block.title}</span>
        {block.isFixed && <Repeat size={11} className="fixed-icon" title="매주 고정 반복" />}
      </div>

      <div className="block-time">
        {block.startTime} ~ {block.endTime} ({formatDurationText(block.startTime, block.endTime)})
      </div>

      {block.location && (
        <div className="block-location">
          <MapPin size={11} /> {block.location}
        </div>
      )}

      {totalSubtasks > 0 && (
        <div className="block-subtasks-count">
          <CheckSquare size={11} />
          <span>{completedSubtasks}/{totalSubtasks} 완료</span>
        </div>
      )}
    </div>
  );
}
