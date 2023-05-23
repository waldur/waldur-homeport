import { Card, Col, ProgressBar, Row, Stack } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

export const ProviderOfferingWelcome = ({
  offering,
}: {
  offering: Offering;
}) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  // TODO: use real data
  const OfferingCompletionPercentage = offering ? 50 : 0;

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col className="order-2 order-sm-1">
            <h2>{translate('Offering progress')}</h2>
            <p>
              {translate(
                'Complete the steps “{link}” in order to fully complete your marketplace offering. The more information gathered in the marketplace page, the higher are the chances of users provisioning your services.',
                {
                  link: (
                    <Link
                      label={translate('Accounting, integration and support')}
                      state="#"
                      className="text-link text-capitalize"
                    />
                  ),
                },
                formatJsxTemplate,
              )}
            </p>
          </Col>
          {showExperimentalUiComponents && (
            <Col sm md="3" className="order-0 order-sm-2 mb-10 mb-sm-0">
              <h2 className="d-none d-sm-block">&nbsp;</h2>
              <Stack direction="horizontal" gap={2} className="mb-2">
                <span className="text-capitalize">
                  {translate('Profile completion')}
                </span>
                <strong className="ms-auto">
                  {OfferingCompletionPercentage}%
                </strong>
              </Stack>
              <ProgressBar
                variant="success"
                now={OfferingCompletionPercentage}
                style={{ height: '0.5rem' }}
              />
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};
