import { FunctionComponent } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

const ReviewStars = ({ className }: { className? }) => {
  return (
    <div className={`rating ${className}`}>
      <div className="rating-label checked">
        <span className="svg-icon">
          <i className="fa fa-star text-gray-600"></i>
        </span>
      </div>
      <div className="rating-label checked">
        <span className="svg-icon">
          <i className="fa fa-star text-gray-600"></i>
        </span>
      </div>
      <div className="rating-label checked">
        <span className="svg-icon">
          <i className="fa fa-star text-gray-600"></i>
        </span>
      </div>
      <div className="rating-label">
        <span className="svg-icon">
          <i className="fa fa-star text-gray-300"></i>
        </span>
      </div>
      <div className="rating-label">
        <span className="svg-icon">
          <i className="fa fa-star text-gray-300"></i>
        </span>
      </div>
    </div>
  );
};

export const PublicOfferingReviews: FunctionComponent = () => (
  <Card className="mb-10" id="reviews">
    <Card.Body>
      <PublicOfferingCardTitle>{translate('Reviews')}</PublicOfferingCardTitle>
      <Row>
        <Col xs={12} lg={{ span: 6, offset: 2 }} className="mb-sm-5">
          <div className="d-flex">
            <h1 className="display-5 fw-bolder me-4">4.5</h1>
            <div>
              <ReviewStars className="display-5" />
              <div className="fs-1 fw-bold">2 Review</div>
            </div>
          </div>
        </Col>
        <Col xs={12} lg={4} className="text-center">
          <Button variant="dark">{translate('Write a review')}</Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={2} className="mb-sm-5">
          <p>Thomas Thaulow</p>
          <p>28. March 2022</p>
        </Col>
        <Col xs={12} lg={6} className="mb-sm-5">
          <h4>Old Docker Version</h4>
          <p>
            Great service, some slow processing when using inside Docker
            containers, probably related to Docker version xx. Would be nice
            with an upgraded Docker version for further use.
          </p>
        </Col>
        <Col xs={12} lg={4} className="text-center">
          <ReviewStars className="display-6 justify-content-center" />
        </Col>
      </Row>
      <Row>
        <Col
          xs={12}
          lg={{ span: 10, offset: 2 }}
          className="mb-sm-5 border border-dashed border-gray-600 bg-light p-8"
        >
          Thanks for your feedback. We will try to upgrade the docker image to
          the latest version.
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={2} className="mb-sm-5">
          <p>Ilja Livenson</p>
          <p>28. March 2022</p>
        </Col>
        <Col xs={12} lg={6} className="mb-sm-5">
          <h4>Great service</h4>
          <p>
            Great service, some slow processing when using inside Docker
            containers, probably related to Docker version xx. Would be nice
            with an upgraded Docker version for further use.
          </p>
        </Col>
        <Col xs={12} lg={4} className="text-center">
          <ReviewStars className="display-6 justify-content-center" />
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
