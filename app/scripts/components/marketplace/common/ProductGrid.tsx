import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ProductsListType } from '@waldur/marketplace/types';

import { ProductCard } from './ProductCard';

interface ProductGridProps extends ProductsListType {
  width?: number;
}

export const ProductGrid: React.SFC<ProductGridProps> = withTranslation((props: ProductGridProps & TranslateProps) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  }

  if (!props.loaded) {
    return (
      <h3 className="text-center">
        {props.translate('Unable to load marketplace offerings.')}
      </h3>
    );
  }

  if (props.loaded && !props.items.length) {
    return (
      <h3 className="text-center">
        {props.translate('There are no offerings in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row>
      {props.items.map((product, index) => (
        <Col key={index} md={props.width} sm={6}>
          <ProductCard product={product}/>
        </Col>
      ))}
    </Row>
  );
});

ProductGrid.defaultProps = {
  width: 3,
};
