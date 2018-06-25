import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Category } from '@waldur/marketplace/types';

interface ListProps {
  categories: Category[];
}

interface NodeProps {
  category: Category;
}

const Node = (props: NodeProps) => {
  return (
    <li className="m-b-xs">
      <i className="fa fa-angle-right"/>
      {' '}
      <Link state="marketplace-list">
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
      <Node category={category} key={index} />
    ))}
  </ul>
);

export const ShopCategories = (props: ListProps) => (
  <section>
    <h3 className="shopping-cart-sidebar-title">
      Shop categories
    </h3>
    <List categories={props.categories}/>
  </section>
);
