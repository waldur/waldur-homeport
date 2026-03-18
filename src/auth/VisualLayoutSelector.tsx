import { CheckIcon } from '@phosphor-icons/react';
import React, { useMemo } from 'react';

import { ENV } from '@waldur/core/config';

import { LayoutPreview } from './LayoutPreview';
import { LAYOUT_OPTIONS, LandingPageLayout } from './layouts';

import './VisualLayoutSelector.css';

interface VisualLayoutSelectorProps {
  value: LandingPageLayout;
  onChange: (layout: LandingPageLayout) => void;
}

export const VisualLayoutSelector: React.FC<VisualLayoutSelectorProps> = ({
  value,
  onChange,
}) => {
  const brandColor = ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#307300';

  const groupedOptions = useMemo(() => {
    return LAYOUT_OPTIONS.reduce(
      (acc, opt) => {
        if (!acc[opt.category]) acc[opt.category] = [];
        acc[opt.category].push(opt);
        return acc;
      },
      {} as Record<string, typeof LAYOUT_OPTIONS>,
    );
  }, []);

  return (
    <div className="layout-selector-root">
      {Object.entries(groupedOptions).map(([category, options]) => (
        <div key={category} className="layout-group">
          <h6 className="group-title">{category}</h6>
          <div className="layout-grid">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`layout-item ${value === option.value ? 'active' : ''}`}
                onClick={() => onChange(option.value)}
              >
                <div className="layout-canvas">
                  <LayoutPreview type={option.value} brandColor={brandColor} />
                  {value === option.value && (
                    <div className="check-overlay">
                      <CheckIcon weight="bold" />
                    </div>
                  )}
                </div>
                <span className="layout-name">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
