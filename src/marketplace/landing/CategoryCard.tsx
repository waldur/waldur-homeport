import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { CategoryGroup } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';
import { wrapTooltip } from '@/table/ActionButton';

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
        {Boolean(props.item.description) &&
          wrapTooltip(
            props.item.description,
            <QuestionIcon
              size={16}
              weight="bold"
              className="ms-2 text-muted mb-1 text-hover-gray-600"
            />,
          )}
      </h3>
      {'offering_count' in props.item &&
        props.item.offering_count !== undefined && (
          <span className="text-muted small">
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
