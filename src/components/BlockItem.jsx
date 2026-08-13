import React from 'react';
import { CATEGORIES } from '../constants/presets';
import { formatDurationText, timeToMinutes } from '../utils/timeUtils';
import { CheckSquare, MapPin, Repeat } from 'lucide-react';

export function BlockItem({ block, slot, style, categories, onClick, isPendingDelete }) {
  const categoryInfo = (categories && categories[block.category]) || CATEGORIES.other;

  const durationMins = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
  const isSmallBlock = durationMins <= 60;

  return (
    <div
      className={`block-item ${isPendingDelete ? 'pending-delete' : ''}`}
      style={{
        ...style,
        backgroundColor: block.color || categoryInfo.defaultColor
      }}
      onClick={() => onClick(block)}
      title={`${block.title} (${slot.startTime} ~ ${slot.endTime})`}
    >
      <div className="block-header">
        <span className="block-icon">{categoryInfo.icon}</span>
        <span className="block-title">{block.title}</span>
      </div>

      <div className="block-time">
        {slot.startTime} ~ {slot.endTime} ({formatDurationText(slot.startTime, slot.endTime)})
      </div>

      {!isSmallBlock && block.location && block.showLocation !== false && (
        <div className="block-location">
          <MapPin size={11} /> {block.location}
        </div>
      )}

      {/* Add Subtasks display */}
      {!isSmallBlock && block.subtasks && block.subtasks.length > 0 && block.showSubtasks !== false && (
        <div className="block-subtasks">
          {block.subtasks.map(st => (
            <div key={st.id} className={`block-subtask-item ${st.completed ? 'completed' : ''}`}>
              {st.completed ? <CheckSquare size={10} className="subtask-icon-checked" /> : <div className="subtask-icon-unchecked" />}
              <span>{st.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Memo display */}
      {!isSmallBlock && block.memo && block.showMemo !== false && (
        <div className="block-memo">
          {block.memo}
        </div>
      )}
    </div>
  );
}
