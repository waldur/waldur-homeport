import { FC } from 'react';

import { translate } from '@waldur/i18n';

import { UIBlockProps } from '../../lib/types';

export const HomePortNavBlock: FC<UIBlockProps> = ({ block }) => {
  const links = block.nav_links;
  if (!links || links.length === 0) return null;

  const variantClasses: Record<string, string> = {
    primary: 'btn btn-sm btn-secondary',
    secondary: 'btn btn-sm btn-tertiary',
    info: 'btn btn-sm btn-tertiary-ghost',
  };

  return (
    <div className="d-flex flex-column gap-2 my-2">
      {block.nav_context && (
        <small className="text-muted">{block.nav_context}</small>
      )}
      <div className="d-flex flex-wrap gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            className={variantClasses[link.variant || 'primary']}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label || translate('Open')}
          </a>
        ))}
      </div>
    </div>
  );
};
