import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, Printer } from 'lucide-react';

export function BackupModal({ isOpen, onClose, blocks, onImport, currentPlanName }) {
  if (!isOpen) return null;

  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);

  const exportDataStr = JSON.stringify(blocks, null, 2);

  const handleDownloadFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportDataStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `routine_schedule_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = (mode) => {
    const originalTitle = document.title;
    if (currentPlanName) {
      document.title = currentPlanName;
    }

    if (mode === 'bw') {
      document.body.classList.add('print-bw');
    } else {
      document.body.classList.add('print-color');
    }
    onClose(); // 모달 닫기
    setTimeout(() => {
      window.print();
      document.body.classList.remove('print-bw', 'print-color');
      document.title = originalTitle;
    }, 300);
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "제목,요일,시작시간,종료시간,카테고리,메모\n";
    
    const daysMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토', 7: '일' };
    
    blocks.forEach(block => {
      if (block.timeSlots && Array.isArray(block.timeSlots)) {
        block.timeSlots.forEach(slot => {
          const row = [
            `"${(block.title || '').replace(/"/g, '""')}"`,
            daysMap[slot.dayOfWeek] || '',
            slot.startTime || '',
            slot.endTime || '',
            block.category || '',
            `"${(block.memo || '').replace(/"/g, '""')}"`
          ];
          csvContent += row.join(",") + "\n";
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `routine_schedule_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(exportDataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        alert('올바른 시간표 백업 JSON 데이터 배열 형식이 아닙니다.');
        return;
      }
      if (confirm(`총 ${parsed.length}개의 블록 데이터를 가져오시겠습니까? (기존 데이터가 덮어씌워집니다)`)) {
        onImport(parsed);
        alert('백업 데이터 복원이 완료되었습니다.');
        onClose();
      }
    } catch (err) {
      alert(`JSON 데이터 파싱 실패: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          alert('파일로부터 데이터 복원이 완료되었습니다.');
          onClose();
        } else {
          alert('올바른 JSON 배열 파일이 아닙니다.');
        }
      } catch (err) {
        alert(`파일 읽기 실패: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Download size={20} /> 시간표 데이터 백업 및 복원
          </h2>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="backup-modal-body">
          {/* Export Section */}
          <div className="backup-section">
            <h3>내보내기 (Export)</h3>
            <p className="sub-desc">일정 데이터를 백업합니다.</p>
            <div className="action-row">
              <button className="btn btn-primary" onClick={handleDownloadFile}>
                <Download size={16} /> JSON 파일 다운로드
              </button>
              <button className="btn btn-accent" onClick={handleDownloadCSV}>
                <Download size={16} /> CSV (엑셀) 다운로드
              </button>
              <button className="btn" onClick={() => handlePrint('bw')}>
                <Printer size={16} /> 흑백 인쇄 (프린트)
              </button>
              <button className="btn btn-primary" onClick={() => handlePrint('color')}>
                <Printer size={16} /> 컬러 인쇄 (프린트)
              </button>
              <button className="btn" onClick={handleCopyClipboard}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '복사 완료!' : '클립보드 복사'}
              </button>
            </div>
          </div>

          <hr className="divider" />

          {/* Import Section */}
          <div className="backup-section">
            <h3>가져오기 및 복원 (Import)</h3>
            <p className="sub-desc">백업 파일을 불러옵니다.</p>
            
            <div className="file-upload-box">
              <label className="btn btn-accent">
                <Upload size={16} /> 백업 JSON 파일 선택
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <form onSubmit={handleImportSubmit} className="import-form">
              <textarea
                className="textarea-field"
                rows={4}
                placeholder="JSON 텍스트 직접 붙여넣기..."
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
              />
              <button type="submit" className="btn full-width margin-top">
                붙여넣은 JSON 데이터로 복원하기
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
