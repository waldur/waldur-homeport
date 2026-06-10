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
                className="d-block text-dark text-hover-primary bg-hover-primary-50 py-2 px-5"
                aria-hidden={true}
                onClick={item.onClick}
              >
                <span className="fs-6 fw-semibold">{item.text}</span>
              </Link>
            ) : (
              // Non-navigable crumb (e.g. an organization the user can't open):
              // render as plain text instead of a link to nowhere (which would
              // otherwise fall back to the 404 route on click).
              <span className="d-block text-muted py-2 px-5 fs-6 fw-semibold">
                {item.text}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
