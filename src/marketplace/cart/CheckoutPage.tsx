import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { connectAngularComponent } from '@waldur/store/connect';

import { BackButton } from './BackButton';
import { ForwardButton } from './ForwardButton';
import { ShoppingCart } from './ShoppingCart';
import { ShoppingCartSidebar } from './ShoppingCartSidebar';
import { ShoppingCartSteps } from './ShoppingCartSteps';

const CheckoutPage = () => (
  <Row>
    <Col lg={8}>
      <ShoppingCartSteps/>
      <ShoppingCart/>
      <div className="display-flex justify-content-between m-t-md">
        <BackButton/>
        <ForwardButton/>
      </div>
    </Col>
    <Col lg={4}>
      <ShoppingCartSidebar/>
    </Col>
  </Row>
);

export default connectAngularComponent(CheckoutPage);
