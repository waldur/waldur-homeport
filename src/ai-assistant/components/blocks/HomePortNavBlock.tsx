import { FC } from 'react';

import { buttonVariants, ButtonVariant } from 'waldur-ui';

import { translate } from '@/i18n';

import { UIBlockProps } from '../../lib/types';

// The block's own 'primary' | 'secondary' | 'info' vocabulary (set by the
// assistant backend, see UIBlock['links'] in lib/types.ts) predates the
// design-token variant names and doesn't line up with them 1:1.
const VARIANT_MAP: Record<'primary' | 'secondary' | 'info', ButtonVariant> = {
  primary: 'secondary',
  secondary: 'tertiary',
  info: 'tertiary-ghost',
};

export const HomePortNavBlock: FC<UIBlockProps> = ({ block }) => {
  const links = block.links;
  if (!links || links.length === 0) return null;

  return (
    <div className="d-flex flex-column gap-2 my-2">
      {block.content && <small className="text-muted">{block.content}</small>}
      <div className="d-flex flex-wrap gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            className={buttonVariants({
              variant: VARIANT_MAP[link.variant || 'primary'],
              size: 'sm',
            })}
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
