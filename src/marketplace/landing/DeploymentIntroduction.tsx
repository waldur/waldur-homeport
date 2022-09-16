import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

const image = require('./images/easy-deployment-steps.jpg');

const getFeatures = () => [
  {
    title: translate('Deploy in minutes'),
    body: translate(
      'Magento server deployment is quick and easy so you don’t fret over the technicalities.',
    ),
  },
  {
    title: translate('Cost efficiently'),
    body: translate(
      'Magento server deployment is quick and easy so you don’t fret over the technicalities.',
    ),
  },
  {
    title: translate('Vendor Neutral'),
    body: translate(
      'Magento server deployment is quick and easy so you don’t fret over the technicalities.',
    ),
  },
];

export const DeploymentIntroduction = () => {
  return (
    <div className="bg-body py-20 mb-20">
      <div className="container-xxl">
        <div className="text-center mb-20">
          <h1>{translate('Deployment made easy, for everyone')}</h1>
          <p className="fs-4 fw-bold mw-900px mx-auto">
            Turn your Ecommerce dreams into reality with Managed Magento
            Hosting. Enjoy blazing fast speed and give your online store the
            edge it always deserved. Migrate for FREE right now!
          </p>
        </div>
        <Row>
          <Col xs={12} lg={5}>
            <div>
              {getFeatures().map((item, i) => (
                <div className="d-flex mb-6" key={i}>
                  <div className="symbol symbol-40px symbol-circle me-8">
                    <div className="symbol-label fs-2 fw-semibold bg-primary"></div>
                  </div>
                  <div className="pt-2">
                    <h3 className="mb-2">{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={12} lg={7} className="text-center">
            <img src={image} className="h-350px" />
          </Col>
        </Row>
      </div>
    </div>
  );
};
