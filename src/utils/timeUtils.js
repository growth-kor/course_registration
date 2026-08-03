// Time parsing & grid layout calculation utilities

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTimeStr(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

// Generate dropdown options in 10-minute steps (e.g., 06:00, 06:10, 06:20 ... 23:50)
export function generate10MinStepOptions(startHour = 6, endHour = 24) {
  const options = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === endHour && m > 0) break; // Don't go past endHour:00
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      options.push(timeStr);
    }
  }
  return options;
}

// Calculate block position (top & height) relative to grid start hour (e.g., 6 AM) and hour row height (e.g. 60px)
export function getBlockGridStyle(startTime, endTime, gridStartHour = 6, hourRowHeight = 60) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const gridStartMins = gridStartHour * 60;

  const offsetMins = Math.max(0, startMins - gridStartMins);
  const durationMins = Math.max(10, endMins - startMins);

  // 1 minute = (hourRowHeight / 60) px = 1px if row height is 60px
  const minuteHeight = hourRowHeight / 60;

  const topPx = offsetMins * minuteHeight;
  const heightPx = durationMins * minuteHeight;

  return {
    top: `${topPx}px`,
    height: `${heightPx}px`
  };
}

// Format duration in hours & minutes (e.g. "1시간 40분" or "2.5시간")
export function formatDurationText(startTime, endTime) {
  const durationMins = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (durationMins <= 0) return '0분';
  const h = Math.floor(durationMins / 60);
  const m = durationMins % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// Calculate total hours by category for statistics
export function calculateCategoryStats(blocks) {
  const stats = {
    class: 0,
    self_study: 0,
    routine: 0,
    other: 0,
    total: 0
  };

  blocks.forEach(blk => {
    const mins = Math.max(0, timeToMinutes(blk.endTime) - timeToMinutes(blk.startTime));
    const hours = mins / 60;
    if (stats[blk.category] !== undefined) {
      stats[blk.category] += hours;
    } else {
      stats.other += hours;
    }
    stats.total += hours;
  });

  return {
    class: Number(stats.class.toFixed(1)),
    self_study: Number(stats.self_study.toFixed(1)),
    routine: Number(stats.routine.toFixed(1)),
    other: Number(stats.other.toFixed(1)),
    total: Number(stats.total.toFixed(1))
  };
}
