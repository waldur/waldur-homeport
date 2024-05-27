import { FC, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { useCategories } from '../category/useCategories';
import { CategoryGroupLink } from '../links/CategoryGroupLink';
import { CategoryLink } from '../links/CategoryLink';

import { CategoryCard } from './CategoryCard';

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

  const items = showAll ? categories.data : categories.data.slice(0, 6);

  return (
    <>
      <Row className="justify-content-center">
        {items.map((item, index) => (
          <Col key={index} xxl={2} xl={3} lg={4} sm={6}>
            <CategoryCard
              item={item}
              as={item.categories ? CategoryGroupLink : CategoryLink}
            />
          </Col>
        ))}
      </Row>
      <div className="d-flex flex-column justify-content-center flex-grow-1">
        <Button
          variant="link"
          size="sm"
          className="text-decoration-underline my-1"
          role="button"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? translate('See less') : translate('See more')}
        </Button>
      </div>
    </>
  );
};
