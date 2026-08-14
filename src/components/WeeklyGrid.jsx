import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../constants/presets';
import { BlockItem } from './BlockItem';
import { getBlockGridStyle, formatTimeLabel } from '../utils/timeUtils';
import { useLanguage } from '../context/LanguageContext';

export function WeeklyGrid({
  blocks,
  showWeekend,
  gridStartHour = 6,
  gridEndHour = 30, // Changed from 24 to 30
  hourRowHeight = 60,
  onBlockClick,
  onEmptySlotClick,
  isDeleteMode,
  pendingDeleteBlockIds,
  selectedEmptySlots = [],
  categories
}) {
  const { lang, t } = useLanguage();
  const activeDays = showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  // Generate 1-hour row markers
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
  const totalGridMins = (gridEndHour - gridStartHour) * 60;
  const currentTimeTopPercent = isCurrentTimeInGrid
    ? (((currentHour - gridStartHour) * 60 + currentMinute) / totalGridMins) * 100
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
        <div className="grid-header-cell time-label-col">{t('time_col')}</div>
        {activeDays.map(day => {
          const isToday = day.id === currentDayOfWeek;
          const localizedDayName = t('days')?.[day.id]?.full || day.full;
          return (
            <div
              key={day.id}
              className={`grid-header-cell day-col ${isToday ? 'today-col' : ''}`}
            >
              <span className="day-name">{localizedDayName}</span>
              {isToday && <span className="today-badge">{t('today')}</span>}
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
              <span className="time-tick-text">{formatTimeLabel(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {activeDays.map(day => {
          const isToday = day.id === currentDayOfWeek;

          return (
            <div
              key={day.id}
              className={`day-column ${isToday ? 'today-column-bg' : ''}`}
              style={{ height: `${hourTicks.length * hourRowHeight}px` }}
            >
              {/* 1-Hour Grid Lines */}
              {hourTicks.map(hour => {
                const timeStr = formatTimeLabel(hour);
                const isSelected = selectedEmptySlots.some(s => s.day === day.id && s.time === timeStr);
                return (
                  <div
                    key={hour}
                    className={`grid-hour-cell ${isSelected ? 'selected' : ''}`}
                    style={{ height: `${hourRowHeight}px` }}
                    onClick={() => onEmptySlotClick(day.id, timeStr)}
                  />
                );
              })}

              {/* Render Blocks for this Day */}
              {blocks.filter(Boolean).map(block => {
                const daySlots = (block.timeSlots || []).filter(ts => ts.dayOfWeek === day.id);
                return daySlots.map(slot => {
                  const style = getBlockGridStyle(slot.startTime, slot.endTime, gridStartHour, hourRowHeight);
                  return (
                    <BlockItem
                      key={slot.id}
                      block={block}
                      slot={slot}
                      style={style}
                      categories={categories}
                      onClick={onBlockClick}
                      isPendingDelete={isDeleteMode && pendingDeleteBlockIds.includes(block.id)}
                    />
                  );
                });
              })}

              {/* Current Time Indicator Line */}
              {isToday && currentTimeTopPercent !== null && (
                <div
                  className="current-time-line"
                  style={{ top: `${currentTimeTopPercent}%` }}
                >
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
