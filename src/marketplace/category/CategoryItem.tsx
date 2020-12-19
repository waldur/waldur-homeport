import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { Category } from '@waldur/marketplace/types';

interface CategoryItemProps {
  category: Category;
  active?: boolean;
}

export const CategoryItem: FunctionComponent<CategoryItemProps> = (props) => (
  <li className={classNames('m-b-xs', { 'link--active': props.active })}>
    <i className="fa fa-angle-right" />{' '}
    <CategoryLink category_uuid={props.category.uuid}>
      {props.category.title}
    </CategoryLink>{' '}
    ({props.category.offering_count})
  </li>
);
