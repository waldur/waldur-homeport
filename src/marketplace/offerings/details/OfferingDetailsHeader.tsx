import { Button, Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Field } from '@waldur/resource/summary';

import { OfferingItemActions } from '../actions/OfferingItemActions';
import { Logo } from '../service-providers/shared/Logo';

import { OfferingDetailsProps } from './OfferingDetails';

export const OfferingDetailsHeader = (props: OfferingDetailsProps) => (
  <div className="d-flex gap-10 flex-grow-1 mb-10">
    {/* LOGO CARD */}
    <Card className="provider-offering-logo">
      <Card.Body>
        <OfferingLogo
          src={props.offering.thumbnail}
          size={50}
          className="offering-small-logo"
        />
        <Logo
          image={props.category.icon}
          placeholder={props.category.title[0]}
          height={100}
          width={100}
        />
      </Card.Body>
    </Card>

    {/* INFO CARD */}
    <Card className="flex-grow-1">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-grow-1">
          <div className="flex-grow-1">
            <h3>{props.offering.name}</h3>
            <i className="text-dark">{props.offering.customer_name}</i>
          </div>
          {props.offering.shared && (
            <div className="is-flex">
              <Button
                variant="light"
                size="sm"
                className="btn-icon me-2"
                onClick={props.refetch}
              >
                <i className="fa fa-refresh" />
              </Button>
              <div className="btn btn-flush">
                <OfferingItemActions
                  offering={props.offering}
                  refreshOffering={props.refetch}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Field label={translate('State')} value={props.offering.state} />
          <Field label={translate('Type')} value={props.offering.type} />
          <Field
            label={translate('Shared')}
            value={props.offering.shared ? translate('Yes') : translate('No')}
          />
          <Field
            label={translate('Billing enabled')}
            value={props.offering.billable ? translate('Yes') : translate('No')}
          />
        </div>
      </Card.Body>
    </Card>
  </div>
);
