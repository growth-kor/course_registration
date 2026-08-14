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

export function formatTimeLabel(hour, minute = 0) {
  const displayHour = hour >= 24 ? hour - 24 : hour;
  return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Generate dropdown options in 10-minute steps (e.g., 06:00, 06:10, 06:20 ... 29:50)
export function generate10MinStepOptions(startHour = 6, endHour = 30) {
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
export function getBlockGridStyle(startTime, endTime, gridStartHour = 6, hourRowHeight = 60, totalGridHours = 18) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const gridStartMins = gridStartHour * 60;

  const offsetMins = Math.max(0, startMins - gridStartMins);
  const durationMins = Math.max(10, endMins - startMins);

  const totalGridMins = totalGridHours * 60;

  const topPercent = (offsetMins / totalGridMins) * 100;
  const heightPercent = (durationMins / totalGridMins) * 100;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
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
export function calculateCategoryStats(blocks, categories) {
  const stats = { total: 0 };
  const safeBlocks = Array.isArray(blocks) ? blocks : [];
  
  if (categories) {
    Object.keys(categories).forEach(catId => {
      stats[catId] = 0;
    });
  }

  safeBlocks.forEach(blk => {
    if (!blk) return;
    let totalMinsForBlock = 0;
    if (blk.timeSlots && Array.isArray(blk.timeSlots)) {
      blk.timeSlots.forEach(slot => {
        totalMinsForBlock += Math.max(0, timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime));
      });
    }
    const hours = totalMinsForBlock / 60;
    
    if (categories && categories[blk.category]) {
      stats[blk.category] += hours;
    } else {
      // fallback to other if deleted or missing
      if (stats.other !== undefined) stats.other += hours;
    }
    stats.total += hours;
  });

  const roundedStats = { total: Number(stats.total.toFixed(1)) };
  if (categories) {
    Object.keys(categories).forEach(catId => {
      roundedStats[catId] = Number((stats[catId] || 0).toFixed(1));
    });
  }
  
  return roundedStats;
}
