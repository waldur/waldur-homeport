import React from 'react';

import { LandingPageLayout } from './layouts';

interface LayoutPreviewProps {
  type: LandingPageLayout;
  brandColor: string;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  type,
  brandColor,
}) => {
  const bg = 'var(--bs-gray-200)';
  const card = 'var(--waldur-bg-primary, #ffffff)';
  const border = 'var(--bs-border-color, #dee2e6)';
  const textMuted = 'var(--bs-gray-400)';

  switch (type) {
    /* --- CLASSIC --- */
    case 'split-screen':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="50" height="60" fill={bg} />
          <rect x="50" width="50" height="60" fill={card} />
          <rect x="60" y="20" width="30" height="20" rx="1" stroke={border} />
        </svg>
      );
    case 'centered-card':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={bg} />
          <rect
            x="30"
            y="10"
            width="40"
            height="40"
            rx="4"
            fill={card}
            stroke={border}
          />
          <circle cx="50" cy="22" r="3" fill={brandColor} />
        </svg>
      );
    case 'minimal':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={card} />
          <rect
            x="35"
            y="15"
            width="30"
            height="30"
            rx="1"
            stroke={border}
            strokeDasharray="2 2"
          />
        </svg>
      );
    case 'full-hero':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={textMuted} />
          <rect width="100" height="60" fill="black" fillOpacity="0.3" />
          <rect x="10" y="15" width="30" height="30" rx="2" fill={card} />
        </svg>
      );
    case 'gradient':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={brandColor} />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
          </defs>
          <rect width="100" height="60" fill="url(#g)" />
          <rect x="35" y="15" width="30" height="30" rx="2" fill={card} />
        </svg>
      );
    case 'stacked':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="25" fill={bg} />
          <rect y="25" width="100" height="35" fill={card} />
          <circle cx="50" cy="12" r="4" fill={brandColor} />
          <rect x="35" y="35" width="30" height="15" rx="1" stroke={border} />
        </svg>
      );

    /* --- VISUAL --- */
    case 'right-split':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="50" height="60" fill={card} />
          <rect x="50" width="50" height="60" fill={bg} />
          <rect x="10" y="20" width="30" height="20" rx="1" stroke={border} />
        </svg>
      );
    case 'glassmorphism':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={brandColor} />
          <circle cx="30" cy="20" r="12" fill="white" fillOpacity="0.2" />
          <rect
            x="30"
            y="10"
            width="40"
            height="40"
            rx="4"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeOpacity="0.3"
          />
        </svg>
      );
    case 'neumorphism':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill="#E0E5EC" />
          <rect
            x="30"
            y="12"
            width="40"
            height="36"
            rx="6"
            fill="#E0E5EC"
            stroke="white"
            strokeOpacity="0.5"
          />
          <rect
            x="38"
            y="22"
            width="24"
            height="6"
            rx="3"
            fill="#E0E5EC"
            stroke="black"
            strokeOpacity="0.05"
          />
        </svg>
      );
    case 'animated-gradient':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={brandColor} fillOpacity="0.7" />
          <path
            d="M0 30 Q 25 10 50 30 T 100 30"
            stroke="white"
            strokeOpacity="0.3"
            fill="none"
          />
          <rect x="35" y="15" width="30" height="30" rx="2" fill={card} />
        </svg>
      );
    case 'video-background':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill="black" />
          <polygon points="45,25 58,30 45,35" fill="white" fillOpacity="0.5" />
          <rect x="35" y="15" width="30" height="30" rx="2" fill={card} />
        </svg>
      );

    /* --- STRUCTURE --- */
    case 'bottom-sheet':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="30" fill={bg} />
          <rect y="30" width="100" height="30" rx="8" fill={card} />
          <rect x="45" y="34" width="10" height="1" rx="0.5" fill={textMuted} />
        </svg>
      );
    case 'tabbed':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={bg} />
          <rect x="25" y="15" width="24" height="6" rx="1" fill={brandColor} />
          <rect x="51" y="15" width="24" height="6" rx="1" fill={card} />
          <rect x="25" y="21" width="50" height="25" fill={card} />
        </svg>
      );
    case 'wizard':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={bg} />
          <rect x="25" y="10" width="50" height="40" rx="2" fill={card} />
          <rect x="30" y="14" width="40" height="2" fill={textMuted} />
          <rect x="30" y="14" width="20" height="2" fill={brandColor} />
        </svg>
      );

    /* --- CONTENT --- */
    case 'stats':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="50" height="60" fill={brandColor} />
          <rect
            x="5"
            y="10"
            width="18"
            height="10"
            rx="1"
            fill="white"
            fillOpacity="0.2"
          />
          <rect
            x="27"
            y="10"
            width="18"
            height="10"
            rx="1"
            fill="white"
            fillOpacity="0.2"
          />
          <rect x="50" width="50" height="60" fill={card} />
        </svg>
      );
    case 'news':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="50" height="60" fill={card} />
          <rect x="55" y="10" width="40" height="12" rx="1" fill={bg} />
          <rect x="55" y="25" width="40" height="12" rx="1" fill={bg} />
        </svg>
      );
    case 'carousel':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect x="50" width="50" height="60" fill={bg} />
          <circle cx="65" cy="50" r="1.5" fill="white" />
          <circle cx="75" cy="50" r="1.5" fill="white" fillOpacity="0.3" />
          <rect width="50" height="60" fill={card} />
        </svg>
      );

    /* --- BRAND --- */
    case 'logo-watermark':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={card} />
          <circle
            cx="50"
            cy="30"
            r="20"
            stroke={brandColor}
            strokeOpacity="0.05"
            strokeWidth="4"
          />
          <rect x="35" y="20" width="30" height="20" rx="1" stroke={border} />
        </svg>
      );
    case 'brand-pattern':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={card} />
          <circle cx="10" cy="10" r="1" fill={brandColor} fillOpacity="0.2" />
          <circle cx="20" cy="20" r="1" fill={brandColor} fillOpacity="0.2" />
          <circle cx="30" cy="10" r="1" fill={brandColor} fillOpacity="0.2" />
          <rect x="35" y="20" width="30" height="20" rx="1" stroke={border} />
        </svg>
      );
    case 'diagonal':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={bg} />
          <polygon points="0,0 60,0 40,60 0,60" fill={card} />
          <rect x="10" y="20" width="25" height="20" rx="1" stroke={border} />
        </svg>
      );
    case 'duotone':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill={brandColor} />
          <rect width="100" height="60" fill="black" fillOpacity="0.2" />
          <rect x="10" y="10" width="35" height="40" rx="2" fill={card} />
        </svg>
      );

    /* --- DYNAMIC --- */
    case 'time-based':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill="#2C3E50" />
          <circle cx="85" cy="15" r="5" fill="#F1C40F" />
          <rect x="30" y="15" width="40" height="30" rx="2" fill={card} />
        </svg>
      );
    case 'seasonal':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill="#27AE60" />
          <path d="M80 10 L85 20 L75 20 Z" fill="white" fillOpacity="0.6" />
          <rect x="30" y="15" width="40" height="30" rx="2" fill={card} />
        </svg>
      );
    case 'weather':
      return (
        <svg viewBox="0 0 100 60" fill="none">
          <rect width="100" height="60" fill="#3498DB" />
          <circle cx="80" cy="15" r="4" fill="white" fillOpacity="0.8" />
          <circle cx="85" cy="18" r="4" fill="white" fillOpacity="0.8" />
          <rect x="30" y="15" width="40" height="30" rx="2" fill={card} />
        </svg>
      );

    default:
      return <rect width="100" height="60" fill={bg} />;
  }
};
