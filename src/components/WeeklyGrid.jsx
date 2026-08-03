import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../constants/presets';
import { BlockItem } from './BlockItem';
import { getBlockGridStyle } from '../utils/timeUtils';

export function WeeklyGrid({
  blocks,
  showWeekend,
  gridStartHour = 6,
  gridEndHour = 24,
  hourRowHeight = 60,
  onBlockClick,
  onEmptySlotClick
}) {
  const activeDays = showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  // Generate 1-hour row markers (e.g. 06:00, 07:00 ... 23:00)
  const hourTicks = [];
  for (let h = gridStartHour; h < gridEndHour; h++) {
    hourTicks.push(h);
  }

  // Track current time for real-time red line indicator
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // JS getDay: Sun 0 -> 7
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isCurrentTimeInGrid = currentHour >= gridStartHour && currentHour < gridEndHour;
  const currentTimeTopPx = isCurrentTimeInGrid
    ? ((currentHour - gridStartHour) * 60 + currentMinute) * (hourRowHeight / 60)
    : null;

  return (
    <div className="weekly-grid-wrapper">
      {/* Time Header Bar (Days) */}
      <div
        className="grid-header-row"
        style={{
          gridTemplateColumns: `70px repeat(${activeDays.length}, 1fr)`
        }}
      >
        <div className="grid-header-cell time-label-col">시간</div>
        {activeDays.map(day => {
          const isToday = day.id === currentDayOfWeek;
          return (
            <div
              key={day.id}
              className={`grid-header-cell day-col ${isToday ? 'today-col' : ''}`}
            >
              <span className="day-name">{day.full}</span>
              {isToday && <span className="today-badge">TODAY</span>}
            </div>
          );
        })}
      </div>

      {/* Main Grid Body */}
      <div
        className="grid-body"
        style={{
          gridTemplateColumns: `70px repeat(${activeDays.length}, 1fr)`
        }}
      >
        {/* Leftmost Column: 1-hour Ticks */}
        <div className="time-ticks-column">
          {hourTicks.map(hour => (
            <div
              key={hour}
              className="time-tick-cell"
              style={{ height: `${hourRowHeight}px` }}
            >
              <span className="time-tick-text">{String(hour).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {activeDays.map(day => {
          const dayBlocks = blocks.filter(blk => blk.dayOfWeek === day.id);
          const isToday = day.id === currentDayOfWeek;

          return (
            <div
              key={day.id}
              className={`day-column ${isToday ? 'today-column-bg' : ''}`}
              style={{ height: `${hourTicks.length * hourRowHeight}px` }}
            >
              {/* 1-Hour Grid Lines */}
              {hourTicks.map(hour => (
                <div
                  key={hour}
                  className="grid-hour-cell"
                  style={{ height: `${hourRowHeight}px` }}
                  onClick={() => onEmptySlotClick(day.id, `${String(hour).padStart(2, '0')}:00`)}
                  title={`${day.full} ${String(hour).padStart(2, '0')}:00 블록 추가`}
                />
              ))}

              {/* Render Blocks for this Day */}
              {dayBlocks.map(block => {
                const style = getBlockGridStyle(block.startTime, block.endTime, gridStartHour, hourRowHeight);
                return (
                  <BlockItem
                    key={block.id}
                    block={block}
                    style={style}
                    onClick={onBlockClick}
                  />
                );
              })}

              {/* Current Time Indicator Line */}
              {isToday && currentTimeTopPx !== null && (
                <div
                  className="current-time-line"
                  style={{ top: `${currentTimeTopPx}px` }}
                >
                  <div className="time-indicator-dot" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
