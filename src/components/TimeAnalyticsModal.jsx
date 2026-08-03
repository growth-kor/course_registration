import React from 'react';
import { X, BarChart2, PieChart, Clock, Award } from 'lucide-react';
import { calculateCategoryStats } from '../utils/timeUtils';
import { CATEGORIES } from '../constants/presets';

export function TimeAnalyticsModal({ isOpen, onClose, blocks }) {
  if (!isOpen) return null;

  const stats = calculateCategoryStats(blocks);
  const total = stats.total || 1; // avoid divide by zero

  const studyPercent = Math.round((stats.self_study / total) * 100);
  const classPercent = Math.round((stats.class / total) * 100);
  const routinePercent = Math.round((stats.routine / total) * 100);
  const otherPercent = Math.round((stats.other / total) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <BarChart2 size={20} /> 주간 시간 분석 및 목표 리포트
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
              <span className="sum-label">순수 자습(공부) 시간</span>
              <span className="sum-value">{stats.self_study} 시간</span>
            </div>
          </div>

          {/* Categorized Time Bar */}
          <div className="section-title">
            <PieChart size={16} /> 카테고리별 시간 비중
          </div>
          
          <div className="brutalist-progress-bar">
            <div className="bar-segment self_study" style={{ width: `${studyPercent}%` }} title={`자습: ${stats.self_study}h (${studyPercent}%)`} />
            <div className="bar-segment class" style={{ width: `${classPercent}%` }} title={`수업: ${stats.class}h (${classPercent}%)`} />
            <div className="bar-segment routine" style={{ width: `${routinePercent}%` }} title={`루틴: ${stats.routine}h (${routinePercent}%)`} />
            <div className="bar-segment other" style={{ width: `${otherPercent}%` }} title={`기타: ${stats.other}h (${otherPercent}%)`} />
          </div>

          {/* Breakdown Table */}
          <div className="stat-rows-container">
            <div className="stat-row-item">
              <span className="cat-tag self_study">{CATEGORIES.self_study.icon} {CATEGORIES.self_study.label}</span>
              <span className="time-val">{stats.self_study} 시간 ({studyPercent}%)</span>
            </div>
            <div className="stat-row-item">
              <span className="cat-tag class">{CATEGORIES.class.icon} {CATEGORIES.class.label}</span>
              <span className="time-val">{stats.class} 시간 ({classPercent}%)</span>
            </div>
            <div className="stat-row-item">
              <span className="cat-tag routine">{CATEGORIES.routine.icon} {CATEGORIES.routine.label}</span>
              <span className="time-val">{stats.routine} 시간 ({routinePercent}%)</span>
            </div>
            <div className="stat-row-item">
              <span className="cat-tag other">{CATEGORIES.other.icon} {CATEGORIES.other.label}</span>
              <span className="time-val">{stats.other} 시간 ({otherPercent}%)</span>
            </div>
          </div>

          {/* Productivity Tip */}
          <div className="tip-box">
            <Award size={18} className="tip-icon" />
            <p>
              <strong>플래너 팁:</strong> 이번 주 고정 자습 목표시간(예: 20시간)을 달성했는지 점검해 보세요.
              10분 단위로 세밀하게 기입된 자습 시간은 집중도 유지에 매우 효과적입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
