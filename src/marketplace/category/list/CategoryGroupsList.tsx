import { useCurrentStateAndParams } from '@uirouter/react';
import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  CategoryGroup,
  CategoryGroupsListType,
} from '@waldur/marketplace/types';

import { CategoryCard } from './CategoryCard';

interface CategoryGroupCardProps {
  categoryGroup: CategoryGroup;
  stateName?: string;
  maxShow?: number;
  title?: string;
}

export const CategoryGroupCard = (props: CategoryGroupCardProps) => {
  return (
    <Card className="mb-6">
      <Card.Header>
        <h3>{props.title || props.categoryGroup.title}</h3>
        {props.categoryGroup?.categories?.length > props.maxShow && (
          <Link
            state={props.stateName}
            params={{ group: props.categoryGroup.uuid }}
            className="text-link fw-normal"
          >
            {translate('View all')}
          </Link>
        )}
      </Card.Header>
      <Card.Body>
        {!props.categoryGroup?.categories?.length ? (
          <h3 className="text-center">
            {translate('There are no categories in this group.')}
          </h3>
        ) : (
          <Row>
            {props.categoryGroup?.categories
              .slice(0, props.maxShow)
              .map((category, index) => (
                <Col key={index} xl={3} lg={4} sm={6}>
                  <CategoryCard category={category} />
                </Col>
              ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};
export const CategoryGroupsList = (props: CategoryGroupsListType) => {
  const { state } = useCurrentStateAndParams();
  const maxShow = props.maxShow ?? Infinity;
  const showData = !(props.loading || !props.loaded || !props.items?.length);

  return showData ? (
    <>
      {props.items.map((group) => (
        <CategoryGroupCard
          key={group.uuid}
          categoryGroup={group}
          maxShow={maxShow}
          stateName={state.name}
        />
      ))}
    </>
  ) : (
    <Card className="mb-6">
      <Card.Body>
        {props.loading ? (
          <LoadingSpinner />
        ) : !props.loaded ? (
          <h3 className="text-center">
            {translate('Unable to load categories.')}
          </h3>
        ) : !props.items?.length ? (
          <h3 className="text-center">
            {translate('There are no categories in marketplace yet.')}
          </h3>
        ) : null}
      </Card.Body>
    </Card>
  );
};
