import { CaretCircleDownIcon, CaretCircleUpIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { useCategories } from '../category/useCategories';
import { CategoryGroupLink } from '../links/CategoryGroupLink';
import { CategoryLink } from '../links/CategoryLink';

import { CategoryCard } from './CategoryCard';

const ITEMS_IN_ROW = 6;

export const CategoriesList: FC = () => {
  const categories = useCategories();
  const [showAll, setShowAll] = useState(false);

  if (categories.isLoading) {
    return <LoadingSpinner />;
  }

  if (categories.isError) {
    return (
      <h3 className="text-center">{translate('Unable to load categories.')}</h3>
    );
  }

  if (!categories.data) {
    return (
      <h3 className="text-center">
        {translate('There are no categories in marketplace yet.')}
      </h3>
    );
  }

  const items = showAll
    ? categories.data
    : categories.data.slice(0, ITEMS_IN_ROW);

  const showMoreButton = categories.data.length > ITEMS_IN_ROW;

  return (
    <div className={!showMoreButton ? 'my-10' : 'mt-10'}>
      <Row className="justify-content-center g-5">
        {items.map((item, index) => (
          <Col key={index} xl={showAll ? 2 : true} lg={4} md={4} sm={6}>
            <CategoryCard
              item={item}
              as={item.categories ? CategoryGroupLink : CategoryLink}
            />
          </Col>
        ))}
      </Row>
      {showMoreButton ? (
        <div className="text-center my-3">
          <Button
            variant="active-secondary"
            className="btn-color-primary btn-icon-right"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? translate('See less') : translate('See more')}
            <span className="svg-icon svg-icon-2">
              {showAll ? (
                <CaretCircleUpIcon weight="bold" />
              ) : (
                <CaretCircleDownIcon weight="bold" />
              )}
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
};
