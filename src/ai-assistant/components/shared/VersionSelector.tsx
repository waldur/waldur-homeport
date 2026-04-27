import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

interface VersionSelectorProps {
  displayLabel: string;
  isViewingHistory: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const VersionSelector: FC<VersionSelectorProps> = ({
  displayLabel,
  isViewingHistory,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="aui-version-selector">
      <button
        className="aui-version-nav-btn"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label={translate('Previous version')}
      >
        <CaretLeftIcon weight="bold" />
      </button>

      <span
        className={`aui-version-label ${isViewingHistory ? 'aui-version-label--history' : ''}`}
      >
        {displayLabel}
      </span>

      <button
        className="aui-version-nav-btn"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label={translate('Next version')}
      >
        <CaretRightIcon weight="bold" />
      </button>
    </div>
  );
};
