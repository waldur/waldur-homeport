import { ComponentType, FunctionComponent } from 'react';
import { CategoryGroup } from 'waldur-js-client';

import { Avatar } from 'waldur-ui';

import { translate } from '@/i18n';

import { Category } from '../types';

import './CategoryCard.scss';

interface CategoryCardProps {
  item: Category | CategoryGroup;
  as?: ComponentType<any>;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => {
  const Component = (props.as || 'div') as any;
  return (
    <Component item={props.item} className="card card-bordered category-card">
      <div className="card-body">
        <div className="category-thumb">
          <Avatar name={props.item.title} src={props.item.icon} size={40} />
        </div>
        <h3 className="text-primary text-center font-medium text-sm mb-0 category-title">
          <span className="ellipsis" title={props.item.title}>
            {props.item.title}
          </span>
        </h3>
        {Boolean(props.item.description) && (
          <p
            className="category-description text-quaternary ellipsis-lines-2"
            title={props.item.description}
          >
            {props.item.description}
          </p>
        )}
        {'offering_count' in props.item &&
          props.item.offering_count !== undefined && (
            <span className="text-quaternary small category-count">
              {props.item.offering_count === 1
                ? translate('{count} offering', { count: 1 })
                : translate('{count} offerings', {
                    count: props.item.offering_count,
                  })}
            </span>
          )}
      </div>
    </Component>
  );
};
