import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash-es';
import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
  marketplaceProviderOfferingsUpdateUserAttributeConfigPartialUpdate,
  OfferingUserAttributeConfig,
} from 'waldur-js-client';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StaffOnlyIndicator } from '@waldur/core/StaffOnlyIndicator';
import { Tip } from '@waldur/core/Tooltip';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@waldur/user/support/profileAttributes';
import { getUser } from '@waldur/workspace/selectors';

import { OfferingEditField } from '../DefaultOfferingEditPanel';

import { FieldEditButton } from './FieldEditButton';
import { OfferingEditPanelProps } from './types';

const TITLE = (
  <>
    {translate('User attribute exposure')}{' '}
    <Tip
      id="user-attribute-exposure-tip"
      label={translate(
        'Configure which user profile attributes are exposed to this service provider when users are provisioned. Exposed attributes become visible in the OfferingUser API responses.',
      )}
      className="mx-2 text-muted"
    >
      <QuestionIcon size={24} weight="fill" />
    </Tip>
  </>
);

interface AttributeFieldDef extends OfferingEditField {
  attribute?: ProfileAttribute;
}

const ALL_ATTRIBUTE_FIELDS: AttributeFieldDef[] = [
  // Always visible (no feature flag)
  {
    key: 'expose_username',
    label: translate('Username'),
    description: translate("User's username"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_full_name',
    label: translate('Full name'),
    description: translate("User's full name"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_email',
    label: translate('Email'),
    description: translate("User's email address"),
    component: AwesomeCheckboxField,
  },
  // Controlled by enabled profile attributes
  {
    key: 'expose_phone_number',
    label: translate('Phone number'),
    description: translate("User's phone number"),
    component: AwesomeCheckboxField,
    attribute: 'phone_number',
  },
  {
    key: 'expose_organization',
    label: translate('Organization'),
    description: translate("User's organization"),
    component: AwesomeCheckboxField,
    attribute: 'organization',
  },
  {
    key: 'expose_job_title',
    label: translate('Job title'),
    description: translate("User's job title"),
    component: AwesomeCheckboxField,
    attribute: 'job_title',
  },
  {
    key: 'expose_affiliations',
    label: translate('Affiliations'),
    description: translate("User's affiliations"),
    component: AwesomeCheckboxField,
    attribute: 'affiliations',
  },
  {
    key: 'expose_gender',
    label: translate('Gender'),
    description: translate("User's gender (ISO 5218)"),
    component: AwesomeCheckboxField,
    attribute: 'gender',
  },
  {
    key: 'expose_personal_title',
    label: translate('Personal title'),
    description: translate('Honorific title'),
    component: AwesomeCheckboxField,
    attribute: 'personal_title',
  },
  {
    key: 'expose_place_of_birth',
    label: translate('Place of birth'),
    description: translate("User's place of birth"),
    component: AwesomeCheckboxField,
    attribute: 'place_of_birth',
  },
  {
    key: 'expose_country_of_residence',
    label: translate('Country of residence'),
    description: translate("User's country of residence"),
    component: AwesomeCheckboxField,
    attribute: 'country_of_residence',
  },
  {
    key: 'expose_nationality',
    label: translate('Nationality'),
    description: translate('Primary nationality'),
    component: AwesomeCheckboxField,
    attribute: 'nationality',
  },
  {
    key: 'expose_nationalities',
    label: translate('Nationalities'),
    description: translate('All citizenships'),
    component: AwesomeCheckboxField,
    attribute: 'nationalities',
  },
  {
    key: 'expose_organization_country',
    label: translate('Organization country'),
    description: translate("Organization's country"),
    component: AwesomeCheckboxField,
    attribute: 'organization_country',
  },
  {
    key: 'expose_organization_type',
    label: translate('Organization type'),
    description: translate('Organization type (SCHAC URN)'),
    component: AwesomeCheckboxField,
    attribute: 'organization_type',
  },
  {
    key: 'expose_eduperson_assurance',
    label: translate('eduPerson assurance'),
    description: translate('REFEDS assurance level'),
    component: AwesomeCheckboxField,
    attribute: 'eduperson_assurance',
  },
  {
    key: 'expose_civil_number',
    label: translate('Civil number'),
    description: translate('Civil/national ID number'),
    component: AwesomeCheckboxField,
    attribute: 'civil_number',
  },
  {
    key: 'expose_birth_date',
    label: translate('Birth date'),
    description: translate('Date of birth'),
    component: AwesomeCheckboxField,
    attribute: 'birth_date',
  },
  {
    key: 'expose_identity_source',
    label: translate('Identity source'),
    description: translate('Identity provider source'),
    component: AwesomeCheckboxField,
    // No feature flag for identity_source - always visible
  },
];

export const UserAttributeConfigSection: FC<OfferingEditPanelProps> = ({
  offering,
  refetch: refetchOffering,
}) => {
  const user = useSelector(getUser);

  // Filter fields based on enabled profile attributes
  const visibleFields = useMemo(
    () =>
      ALL_ATTRIBUTE_FIELDS.filter(
        (field) =>
          !field.attribute || isProfileAttributeEnabled(field.attribute),
      ),
    [],
  );

  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['offering-user-attribute-config', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsUserAttributeConfigRetrieve({
        path: { uuid: offering.uuid },
      }).then((response) => response.data),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const update = useCallback(
    async (formData: Partial<OfferingUserAttributeConfig>) => {
      await marketplaceProviderOfferingsUpdateUserAttributeConfigPartialUpdate({
        path: { uuid: offering.uuid },
        body: formData,
      });
      await refetch();
      await refetchOffering();
    },
    [offering.uuid, refetch, refetchOffering],
  );

  if (isLoading) {
    return (
      <FormTable.Card title={TITLE} className="card-bordered mb-7">
        <LoadingSpinner />
      </FormTable.Card>
    );
  }

  if (error) {
    return (
      <FormTable.Card title={TITLE} className="card-bordered mb-7">
        <LoadingErred
          message={translate('Unable to load user attribute configuration.')}
          loadData={refetch}
        />
      </FormTable.Card>
    );
  }

  return (
    <FormTable.Card title={TITLE} className="card-bordered mb-7">
      <FormTable>
        {visibleFields.map((field) => (
          <FormTable.Item
            key={field.key}
            label={field.label}
            description={field.description}
            value={<CheckOrX value={get(config, field.key)} />}
            actions={
              user?.is_staff ? (
                <>
                  <StaffOnlyIndicator />
                  <FieldEditButton
                    title={field.label}
                    scope={config}
                    name={field.key}
                    callback={update}
                    fieldComponent={AwesomeCheckboxField}
                    hideLabel={field.hideLabel}
                  />
                </>
              ) : null
            }
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
