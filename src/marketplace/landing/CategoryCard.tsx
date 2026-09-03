import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { CategoryGroup } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';

import { Category } from '../types';

import './CategoryCard.scss';

interface CategoryCardProps {
  item: Category | CategoryGroup;
  as;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => (
  <Card as={props.as} item={props.item} className="card-bordered category-card">
    <Card.Body>
      <div className="category-thumb">
        <Avatar
          name={props.item.title}
          src={props.item.icon}
          circle
          size={40}
        />
      </div>
      <h3 className="text-dark text-center fw-bold fs-6 mb-0 category-title">
        <span className="ellipsis" title={props.item.title}>
          {props.item.title}
        </span>
      </h3>
      {Boolean(props.item.description) && (
        <p
          className="category-description text-muted ellipsis-lines-2"
          title={props.item.description}
        >
          {props.item.description}
        </p>
      )}
      {'offering_count' in props.item &&
        props.item.offering_count !== undefined && (
          <span className="text-muted small category-count">
            {props.item.offering_count === 1
              ? translate('{count} offering', { count: 1 })
              : translate('{count} offerings', {
                  count: props.item.offering_count,
                })}
          </span>
        )}
    </Card.Body>
  </Card>
);
