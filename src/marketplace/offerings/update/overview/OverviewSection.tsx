import { Card, Table } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';

import { EditOverviewButton } from './EditOverviewButton';
import { OfferingLocationButton } from './OfferingLocationButton';
import { OfferingLogoButton } from './OfferingLogoButton';
import { SetAccessPolicyButton } from './SetAccessPolicyButton';
import { Attribute } from './types';

const attributes: Attribute[] = [
  {
    key: 'name',
    title: translate('Name'),
    type: 'string',
    maxLength: 150,
    required: true,
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
    key: 'privacy_policy_link',
    title: translate('Privacy policy link'),
    type: 'string',
    maxLength: 200,
  },
  {
    key: 'terms_of_service',
    title: translate('Terms of service link'),
    type: 'string',
    maxLength: 200,
  },
];

export const OverviewSection = (props) => {
  return (
    <Card className="mb-10">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">{translate('General')}</div>
      </div>
      <Card.Body>
        <Table bordered={true} hover={true} responsive={true}>
          <tbody>
            {attributes.map((attribute, attributeIndex) => (
              <tr key={attributeIndex}>
                <td className="col-md-3">{attribute.title}</td>
                <td className="col-md-9">
                  {attribute.type === 'html' ? (
                    <FormattedHtml html={props.offering[attribute.key]} />
                  ) : (
                    props.offering[attribute.key] || 'N/A'
                  )}
                </td>
                {props.offering.type === REMOTE_OFFERING_TYPE ? null : (
                  <td className="row-actions">
                    <div>
                      <EditOverviewButton
                        offering={props.offering}
                        refetch={props.refetch}
                        attribute={attribute}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            <tr>
              <td className="col-md-3">{translate('Location')}</td>
              <td className="col-md-9">
                <i
                  className={
                    props.offering.latitude && props.offering.longitude
                      ? 'fa fa-check text-info'
                      : 'fa fa-times text-danger'
                  }
                />
              </td>
              <td className="row-actions">
                <div>
                  <OfferingLocationButton
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Access policies')}</td>
              <td className="col-md-9">
                {props.offering.divisions.length > 0
                  ? props.offering.divisions.map(({ name }) => name).join(', ')
                  : 'N/A'}
              </td>
              <td className="row-actions">
                <div>
                  <SetAccessPolicyButton
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Logo')}</td>
              <td className="col-md-9">
                <i
                  className={
                    props.offering.thumbnail
                      ? 'fa fa-check text-info'
                      : 'fa fa-times text-danger'
                  }
                />
              </td>
              <td className="row-actions">
                <div>
                  <OfferingLogoButton
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
