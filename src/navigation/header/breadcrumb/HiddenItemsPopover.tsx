import { UISref } from '@uirouter/react';
import { FC } from 'react';

import { IBreadcrumbItem } from '@waldur/navigation/types';

interface HiddenItemsPopoverProps {
  items: IBreadcrumbItem[];
}

export const HiddenItemsPopover: FC<HiddenItemsPopoverProps> = ({ items }) => {
  return (
    <div className="mh-300px overflow-auto">
      <ul className="list-unstyled">
        {items.map((item) => (
          <li key={item.key}>
            <UISref to={item.to} params={item.params}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className="d-block text-dark text-hover-primary bg-hover-primary-50 py-2 px-5"
                aria-hidden={true}
              >
                <span className="fs-6 fw-semibold">{item.text}</span>
              </a>
            </UISref>
          </li>
        ))}
      </ul>
    </div>
  );
};
