import { useState, FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const CookiesConsent: FunctionComponent = () => {
  const [accepted, setAccepted] = useState(
    localStorage['hideCookiesConsent'] === 'true',
  );

  if (accepted) {
    return null;
  }

  const hideConsent = () => {
    setAccepted(true);
    localStorage['hideCookiesConsent'] = 'true';
  };

  return (
    <Row className="blue-bg p-xs">
      <Col sm={10} xs={12} className="text-center">
        <h3 className="font-normal">
          {translate(
            'This website uses cookies to ensure you get the best experience on our website.',
          )}{' '}
          <a
            className="text-white"
            href="http://cookies.insites.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            {translate('Learn more')}
          </a>
        </h3>
      </Col>
      <Col sm={2} xs={12} className="text-center">
        <button className="btn btn-xl btn-primary" onClick={hideConsent}>
          {translate('Got it!')}
        </button>
      </Col>
    </Row>
  );
};
