import React from 'react';
import { ExternalLink } from 'lucide-react';

export function FooterCard() {
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
          <div className="footer-bio-line">
            <span className="footer-author-name">sungjang (@growth-kor)</span>
            <span className="footer-bio-quote">"give me a chance"</span>
          </div>
          <div className="footer-copyright">
            © 2026 growth-kor. All rights reserved.
          </div>
        </div>
      </div>

      <div className="footer-card-right">
        <a 
          href="https://github.com/growth-kor" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn footer-action-btn"
        >
          <span>공식 페이지 / GitHub</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </footer>
  );
}
