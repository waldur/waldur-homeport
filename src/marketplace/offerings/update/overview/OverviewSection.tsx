import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';

import { OverviewButton } from './OverviewButton';

export const OverviewSection = (props) => {
  const schema = {
    key: 'overview',
    title: translate('Overview'),
    attributes: [
      {
        key: 'name',
        title: translate('Name'),
        type: 'string',
      },
      {
        key: 'description',
        title: translate('Description'),
        type: 'html',
      },
      {
        key: 'full_description',
        title: translate('Full description'),
        type: 'html',
      },
      {
        key: 'terms_of_service',
        title: translate('Terms of service'),
        type: 'string',
      },
      {
        key: 'access_url',
        title: translate('Access URL'),
        type: 'string',
      },
    ],
  } as any;
  return (
    <Card className="mb-10">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">{translate('General')}</div>
        {props.offering.type === REMOTE_OFFERING_TYPE ? null : (
          <div className="card-toolbar">
            <OverviewButton offering={props.offering} refetch={props.refetch} />
          </div>
        )}
      </div>
      <Card.Body>
        <AttributesTable attributes={props.offering} sections={[schema]} />
      </Card.Body>
    </Card>
  );
};
