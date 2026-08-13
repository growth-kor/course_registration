import React from 'react';
import { X, BarChart2, PieChart, Clock, Award } from 'lucide-react';
import { calculateCategoryStats } from '../utils/timeUtils';
import { CATEGORIES } from '../constants/presets';

export function TimeAnalyticsModal({ isOpen, onClose, blocks, categories }) {
  if (!isOpen) return null;

  const safeCategories = categories || {};
  const stats = calculateCategoryStats(blocks, safeCategories);
  const total = stats.total || 1; // avoid divide by zero

  const categoryPercents = {};
  let topCategory = null;
  let maxHours = -1;

  Object.keys(safeCategories).forEach(catId => {
    categoryPercents[catId] = Math.round((stats[catId] / total) * 100);
    if (stats[catId] > maxHours) {
      maxHours = stats[catId];
      topCategory = safeCategories[catId];
    }
  });

  const topCategoryLabel = topCategory ? topCategory.label : '최대 비중';
  const topCategoryHours = maxHours > 0 ? maxHours : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <BarChart2 size={20} /> 주간 시간 분석
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="analytics-body">
          {/* Summary Box */}
          <div className="summary-banner">
            <div className="sum-item">
              <span className="sum-label">이번 주 총 할당 시간</span>
              <span className="sum-value">{stats.total} 시간</span>
            </div>
            <div className="sum-item highlight">
              <span className="sum-label">{topCategoryLabel} 시간</span>
              <span className="sum-value">{topCategoryHours} 시간</span>
            </div>
          </div>

          {/* Categorized Time Bar */}
          <div className="section-title">
            <PieChart size={16} /> 카테고리별 시간 비중
          </div>
          
          <div className="brutalist-progress-bar">
            {Object.values(safeCategories).filter(Boolean).map(cat => {
              const pct = categoryPercents[cat.id] || 0;
              if (pct === 0) return null;
              return (
                <div 
                  key={cat.id} 
                  className="bar-segment" 
                  style={{ width: `${pct}%`, backgroundColor: cat.defaultColor }} 
                  title={`${cat.label}: ${stats[cat.id]}h (${pct}%)`} 
                />
              );
            })}
          </div>

          {/* Breakdown Table */}
          <div className="stat-rows-container">
            {Object.values(safeCategories).filter(Boolean).map(cat => {
              const pct = categoryPercents[cat.id] || 0;
              return (
                <div key={cat.id} className="stat-row-item">
                  <span className="cat-tag" style={{ borderLeftColor: cat.defaultColor }}>
                    {cat.icon} {cat.label}
                  </span>
                  <span className="time-val">{stats[cat.id]} 시간 ({pct}%)</span>
                </div>
              );
            })}
          </div>


        </div>
      </div>
    </div>
  );
}
