import React from 'react';
import { ExternalLink, BookOpen, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function FooterCard({ onOpenGuide }) {
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <footer className="footer-card-container">
      <div className="footer-card-left">
        <a 
          href="https://github.com/growth-kor" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-avatar-link"
          title="growth-kor GitHub 프로필"
        >
          <img 
            src="https://github.com/growth-kor.png" 
            alt="growth-kor profile" 
            className="footer-avatar-img"
            onError={(e) => {
              // Fallback placeholder if image fails to load
              e.target.style.display = 'none';
            }}
          />
        </a>

        <div className="footer-info-block">
          <div className="footer-brand-title">
            <span className="footer-brand-name">GROWTH-KOR</span>
            <span className="footer-brand-badge">STUDIO</span>
          </div>
          <div className="footer-copyright">
            © 2026 growth-kor. All rights reserved.
          </div>
        </div>
      </div>

      <div className="footer-card-right" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          type="button"
          onClick={onOpenGuide}
          className="btn footer-action-btn"
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <BookOpen size={15} />
          <span>{t('footer_guide')}</span>
        </button>

        <button 
          type="button"
          onClick={toggleLanguage}
          className="btn footer-action-btn"
          title="언어 변경 (KO / EN / ZH) / Switch Language"
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 'bold' }}
        >
          <Globe size={15} />
          <span>{lang === 'ko' ? '🌐 한국어 (KO)' : (lang === 'en' ? '🌐 English (EN)' : '🌐 简体中文 (ZH)')}</span>
        </button>

        <a 
          href="https://github.com/growth-kor" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn footer-action-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <span>{t('footer_github')}</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </footer>
  );
}
