import React, { Fragment } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { BreadcrumbItem } from './types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  activeItem?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  activeItem,
}) => (
  <ul className="breadcrumb breadcrumb-separatorless fw-bold fs-7 my-1">
    {items.map((item, index) => (
      <Fragment key={index}>
        <li className="breadcrumb-item text-muted">
          {item.action ? (
            <a
              onClick={() => item.action()}
              className="text-muted text-hover-primary"
            >
              {translate(item.label)}
            </a>
          ) : item.state ? (
            <Link state={item.state} params={item.params}>
              {translate(item.label)}
            </Link>
          ) : (
            translate(item.label)
          )}
        </li>
        <li className="breadcrumb-item">
          <span className="bullet bg-gray-300 w-5px h-2px"></span>
        </li>
      </Fragment>
    ))}
    {activeItem && (
      <li className="breadcrumb-item text-dark">{translate(activeItem)}</li>
    )}
  </ul>
);
