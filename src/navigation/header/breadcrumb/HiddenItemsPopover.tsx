import { FC } from 'react';

import { Link } from '@/core/Link';
import { IBreadcrumbItem } from '@/navigation/types';

interface HiddenItemsPopoverProps {
  items: IBreadcrumbItem[];
}

export const HiddenItemsPopover: FC<HiddenItemsPopoverProps> = ({ items }) => {
  return (
    <div className="mh-300px overflow-auto">
      <ul className="list-unstyled mb-0">
        {items.map((item) => (
          <li key={item.key}>
            {item.to ? (
              <Link
                state={item.to}
                params={item.params}
                className="block text-brand hover:bg-[var(--bg-brand-primary-alt)] py-2 px-5"
                onClick={item.onClick}
              >
                <span className="text-sm">{item.text}</span>
              </Link>
            ) : (
              // Non-navigable crumb (e.g. an organization the user can't open):
              // render as plain text instead of a link to nowhere (which would
              // otherwise fall back to the 404 route on click).
              <span className="block text-quaternary py-2 px-5 text-sm">
                {item.text}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
