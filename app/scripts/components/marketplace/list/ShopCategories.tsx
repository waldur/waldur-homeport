import * as classNames from 'classnames';
import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Category } from '@waldur/marketplace/types';

import './ShopCategories.scss';

interface ListProps {
  categories: Category[];
  currentCategoryUuid?: string;
}

interface NodeProps {
  category: Category;
  active?: boolean;
}

const Node = (props: NodeProps) => {
  return (
    <li className={classNames('m-b-xs', {'link--active': props.active})}>
      <i className="fa fa-angle-right"/>
      {' '}
      <Link state="marketplace-list" params={{category_uuid: props.category.uuid}}>
        {props.category.title}
      </Link>
      {' '}
      ({props.category.offering_count})
    </li>
  );
};

const List = (props: ListProps) => (
  <ul className="list-unstyled">
    {props.categories.map((category, index) => (
      <Node
        category={category}
        key={index}
        active={props.currentCategoryUuid === category.uuid}
      />
    ))}
  </ul>
);

export const ShopCategories = (props: ListProps) => (
  <section>
    <h3 className="shopping-cart-sidebar-title">
      Shop categories
    </h3>
    <List
      categories={props.categories}
      currentCategoryUuid={props.currentCategoryUuid}
    />
  </section>
);
