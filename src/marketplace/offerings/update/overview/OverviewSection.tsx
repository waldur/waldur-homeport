import { Check, X } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { EditGettingStartedButton } from './EditGettingStartedButton';
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
    type: 'html',
  },
  {
    key: 'privacy_policy_link',
    title: translate('Privacy policy link'),
    type: 'string',
    maxLength: 200,
  },
  {
    key: 'terms_of_service_link',
    title: translate('Terms of service link'),
    type: 'string',
    maxLength: 200,
  },
  {
    key: 'slug',
    title: translate('Slug'),
    type: 'string',
    maxLength: 50,
  },
];

export const OverviewSection: FC<OfferingSectionProps> = (props) => {
  return (
    <Card>
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          <span className="me-2">{translate('General')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
      </Card.Header>
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
                {props.offering.latitude && props.offering.longitude ? (
                  <Check weight="bold" className="text-info" />
                ) : (
                  <X weight="bold" className="text-danger" />
                )}
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
                {props.offering.organization_groups.length > 0
                  ? props.offering.organization_groups
                      .map(({ name }) => name)
                      .join(', ')
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
                {props.offering.thumbnail ? (
                  <Check weight="bold" className="text-info" />
                ) : (
                  <X weight="bold" className="text-danger" />
                )}
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
            <tr>
              <td className="col-md-3">
                {translate('Getting started instructions')}
              </td>
              <td className="col-md-9">
                {props.offering.getting_started ? (
                  <Check weight="bold" className="text-info" />
                ) : (
                  <X weight="bold" className="text-danger" />
                )}
              </td>
              <td className="row-actions">
                <div>
                  <EditGettingStartedButton
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
