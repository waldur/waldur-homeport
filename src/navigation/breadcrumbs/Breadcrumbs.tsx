import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { Item } from './types';

interface BreadcrumbsProps {
  items: Item[];
  activeItem: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  activeItem,
}) => (
  <ol className="breadcrumb">
    {items.map((item, index) => (
      <li key={index}>
        {item.action ? (
          <a onClick={() => item.action()}>{translate(item.label)}</a>
        ) : item.state ? (
          <Link state={item.state} params={item.params}>
            {translate(item.label)}
          </Link>
        ) : (
          translate(item.label)
        )}
      </li>
    ))}
    <li className="active">
      <strong>{translate(activeItem)}</strong>
    </li>
  </ol>
);
