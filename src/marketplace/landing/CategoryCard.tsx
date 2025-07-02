import { CubeIcon, QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { CategoryGroup } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { Category } from '../types';

import './CategoryCard.scss';

interface CategoryCardProps {
  item: Category | CategoryGroup;
  as;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => (
  <Card as={props.as} item={props.item} className="card-bordered category-card">
    <Card.Body>
      <div className={'category-thumb' + (!props.item.icon ? ' no-image' : '')}>
        {props.item.icon ? (
          <Avatar
            name={props.item.title}
            src={props.item.icon}
            circle
            size={40}
          />
        ) : (
          <CubeIcon weight="bold" size={20} />
        )}
      </div>
      <h3 className="text-dark text-center fw-bold fs-6 mb-0">
        {props.item.title}
        {Boolean(props.item.description) &&
          wrapTooltip(
            props.item.description,
            <QuestionIcon
              size={16}
              weight="bold"
              className="ms-2 text-muted mb-1 text-hover-gray-600"
              data-testid="tooltip"
            />,
          )}
      </h3>
    </Card.Body>
  </Card>
);
