import { UISref } from '@uirouter/react';
import { ReactNode } from 'react';

import { ItemIcon } from '@waldur/navigation/workspace/context-selector/ItemIcon';

interface SearchItemProps {
  title: string;
  subtitle?: string;
  image?: string;
  to: string;
  params?: object;
  badge?: ReactNode;
}

export const SearchItem = (props: SearchItemProps) => (
  <UISref to={props.to} params={props.params}>
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <a className="d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50">
      <ItemIcon
        item={{ image: props.image, name: props.title }}
        className="me-4"
        circle
      />
      <div className="d-flex flex-column justify-content-start fw-semibold">
        <span className="fs-6 fw-semibold">{props.title}</span>
        {Boolean(props.subtitle) && (
          <span className="fs-7 fw-semibold text-muted">{props.subtitle}</span>
        )}
      </div>
      {props.badge && <div className="ms-auto">{props.badge}</div>}
    </a>
  </UISref>
);
