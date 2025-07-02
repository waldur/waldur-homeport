import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';

import { OfferingSectionProps } from '../types';

import { EditGettingStartedButton } from './EditGettingStartedButton';
import { EditOverviewButton } from './EditOverviewButton';
import { OfferingLocationButton } from './OfferingLocationButton';
import { OfferingMediaButton } from './OfferingMediaButton';
import { SetAccessPolicyButton } from './SetAccessPolicyButton';
import { Attribute } from './types';

const attributes: Attribute[] = [
  {
    key: 'name',
    title: translate('Name'),
    type: 'string',
    maxLength: 150,
    required: true,
    description: translate(
      "Enter the offering's name as it will appear to users.",
    ),
    requiredMsg: translate('Offering name is required.'),
  },
  {
    key: 'description',
    title: translate('Description'),
    type: 'html',
    description: translate('Provide a brief overview of the offering.'),
  },
  {
    key: 'full_description',
    title: translate('Full description'),
    type: 'html',
    description: translate(
      'Add a detailed explanation of what the offering includes.',
    ),
  },
  {
    key: 'terms_of_service',
    title: translate('Terms of service'),
    type: 'html',
    description: translate(
      'Specify the terms users must agree to when accessing the offering.',
    ),
  },
  {
    key: 'privacy_policy_link',
    title: translate('Privacy policy link'),
    type: 'string',
    maxLength: 200,
    description: translate(
      'Add a link to your privacy policy for this offering.',
    ),
  },
  {
    key: 'terms_of_service_link',
    title: translate('Terms of service link'),
    type: 'string',
    maxLength: 200,
    description: translate('Add a link to the full terms of service.'),
  },
  {
    key: 'access_url',
    title: translate('Access URL'),
    type: 'string',
    maxLength: 200,
    description: translate(
      'Provide the URL users will use to access the offering.',
    ),
  },
  {
    key: 'slug',
    title: translate('Slug'),
    type: 'string',
    maxLength: 50,
    description: translate(
      'A POSIX-friendly unique identifier for the offering.',
    ),
  },
];

export const OverviewSection: FC<OfferingSectionProps> = (props) => {
  return (
    <FormTable.Card
      title={translate('General')}
      loading={props.loading}
      refetch={props.refetch}
      className="card-bordered"
    >
      <FormTable>
        {attributes.map((attribute, attributeIndex) => (
          <FormTable.Item
            key={attributeIndex}
            label={attribute.title}
            value={
              attribute.type === 'html' ? (
                <FormattedHtml html={props.offering[attribute.key]} />
              ) : (
                props.offering[attribute.key] || 'N/A'
              )
            }
            description={attribute.description}
            actions={
              <>
                {props.offering.type === REMOTE_OFFERING_TYPE ? (
                  <Tip
                    label={translate(
                      'Field is synchronised from the remote offering',
                    )}
                    id={`remote-offering-tip-${attribute.key}`}
                  >
                    <EditOverviewButton
                      offering={props.offering}
                      refetch={props.refetch}
                      attribute={attribute}
                      disabled={true}
                    />
                  </Tip>
                ) : (
                  <EditOverviewButton
                    offering={props.offering}
                    refetch={props.refetch}
                    attribute={attribute}
                  />
                )}
              </>
            }
            warnTooltip={attribute.required && attribute.requiredMsg}
          />
        ))}
        <FormTable.Item
          key="location"
          label={translate('Location')}
          value={
            props.offering.latitude && props.offering.longitude ? (
              <CheckIcon weight="bold" className="text-info" />
            ) : (
              <XIcon weight="bold" className="text-danger" />
            )
          }
          description={translate('Specify where the offering is hosted.')}
          actions={
            <OfferingLocationButton
              offering={props.offering}
              refetch={props.refetch}
            />
          }
        />

        <FormTable.Item
          key="access_policies"
          label={translate('Access policies')}
          value={
            props.offering.organization_groups.length > 0
              ? props.offering.organization_groups
                  .map(({ name }) => name)
                  .join(', ')
              : 'N/A'
          }
          description={translate(
            'Define the organization groups that are allowed to access the offering.',
          )}
          actions={
            <SetAccessPolicyButton
              offering={props.offering}
              refetch={props.refetch}
            />
          }
        />

        <FormTable.Item
          key="logo"
          label={translate('Logo')}
          value={
            props.offering.thumbnail ? (
              <CheckIcon weight="bold" className="text-info" />
            ) : (
              <XIcon weight="bold" className="text-danger" />
            )
          }
          description={translate(
            'Upload an image to represent the offering visually.',
          )}
          actions={
            <OfferingMediaButton
              offering={props.offering}
              refetch={props.refetch}
              mediaType="thumbnail"
            />
          }
        />

        <FormTable.Item
          key="image"
          label={translate('Image')}
          value={
            props.offering.image ? (
              <CheckIcon weight="bold" className="text-info" />
            ) : (
              <XIcon weight="bold" className="text-danger" />
            )
          }
          description={translate('Upload a background image for the offering.')}
          actions={
            <OfferingMediaButton
              offering={props.offering}
              refetch={props.refetch}
              mediaType="image"
            />
          }
        />

        <FormTable.Item
          key="getting_started"
          label={translate('Getting started instructions')}
          value={
            props.offering.getting_started ? (
              <CheckIcon weight="bold" className="text-info" />
            ) : (
              <XIcon weight="bold" className="text-danger" />
            )
          }
          description={translate(
            'Provide steps to help users begin using the offering.',
          )}
          actions={
            <EditGettingStartedButton
              offering={props.offering}
              refetch={props.refetch}
            />
          }
        />
      </FormTable>
    </FormTable.Card>
  );
};
