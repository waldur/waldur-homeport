import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

const DemoButton = () => (
  <button className="btn btn-outline btn-success">
    <i className="fa fa-comment"/>
    {' '}
    Request demo
  </button>
);

export const DetailsTab = props => (
  <Row className="m-t-md">
    <Col md={6}>
      <h4>Product details</h4>
      <div dangerouslySetInnerHTML={{__html: props.product.description}}/>
    </Col>
    <Col md={6}>
      <h4>Vendor details</h4>
      <div dangerouslySetInnerHTML={{__html: props.product.vendorDetails}}/>
      <DemoButton/>
    </Col>
  </Row>
);
