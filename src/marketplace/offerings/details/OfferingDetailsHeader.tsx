import { Button, Card, Row, Col } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Field } from '@waldur/resource/summary';

import { OfferingEditActions } from '../actions/OfferingEditActions';
import { OfferingViews } from '../OfferingViews';
import { Logo } from '../service-providers/shared/Logo';

export const OfferingDetailsHeader = ({ offering, category, refetch }) => (
  <Row className="mb-10">
    <Col lg={8}>
      <Card>
        <Card.Body className="d-flex flex-row gap-10">
          <div className="provider-offering-logo">
            <OfferingLogo
              src={offering.thumbnail}
              size={50}
              className="offering-small-logo"
            />
            <Logo
              image={category.icon}
              placeholder={category.title[0]}
              height={100}
              width={100}
            />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <div className="d-flex flex-grow-1">
              <div className="flex-grow-1">
                <h3>{offering.name}</h3>
                <i className="text-dark">{offering.customer_name}</i>
              </div>
            </div>
            <div className="mt-4">
              <Field label={translate('State')} value={offering.state} />
              <Field
                label={translate('Type')}
                value={getLabel(offering.type)}
              />
              <Field
                label={translate('Shared')}
                value={offering.shared ? translate('Yes') : translate('No')}
              />
              <Field
                label={translate('Billing enabled')}
                value={offering.billable ? translate('Yes') : translate('No')}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>

    <Col lg={4} className="d-flex">
      <Card className="flex-grow-1">
        <Card.Body>
          <Button
            variant="light"
            size="sm"
            className="btn-icon me-2"
            onClick={refetch}
          >
            <i className="fa fa-refresh" />
          </Button>
          <div className="btn btn-flush">
            <OfferingEditActions
              offering={offering}
              refreshOffering={refetch}
            />
          </div>
          <OfferingViews row={offering} />
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
