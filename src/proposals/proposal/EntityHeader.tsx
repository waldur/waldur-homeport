import { ReactNode } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

interface EntityHeaderProps {
  title: string;
  slug: string;
  badge: ReactNode;
  helpText?: string;
  className?: string;
}

export const EntityHeader = ({
  title,
  slug,
  badge,
  helpText,
  className,
}: EntityHeaderProps) => (
  <div className={className}>
    <div className="d-flex align-items-center mb-1">
      <h1 className="mb-0 fs-1x">{title}</h1>
      <div className="ms-4">{badge}</div>
    </div>
    <p className="fs-6 text-muted mb-1">
      ID: {slug}{' '}
      <CopyToClipboardButton
        value={slug}
        onlyButton
        size={20}
        buttonClassName="ms-2"
      />
    </p>
    {helpText && <p className="fs-6 text-muted mb-0">{helpText}</p>}
  </div>
);
