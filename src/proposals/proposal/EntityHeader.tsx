import { ReactNode } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';

interface EntityHeaderProps {
  title: string;
  slug: string;
  /** Defaults to "ID". The slug is what a user quotes to support, so it is
   *  relabelled rather than hidden where the object has another name. */
  idLabel?: string;
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
  idLabel,
}: EntityHeaderProps) => (
  <div className={className}>
    <div className="d-flex align-items-center mb-1">
      <h1 className="mb-0 fs-1x">{title}</h1>
      <div className="ms-4">{badge}</div>
    </div>
    <p className="fs-6 text-muted mb-1">
      {idLabel ?? translate('ID')}: {slug}{' '}
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
