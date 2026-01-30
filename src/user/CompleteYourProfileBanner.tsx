import { WarningCircleIcon } from '@phosphor-icons/react';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';

// Field name to human-readable label mapping
const FIELD_LABELS: Record<string, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  phone_number: 'Phone number',
  organization: 'Organization',
  job_title: 'Job position',
  native_name: 'Native name',
  personal_title: 'Personal title',
  gender: 'Gender',
  place_of_birth: 'Place of birth',
  country_of_residence: 'Country of residence',
  nationality: 'Nationality',
  nationalities: 'Nationalities',
  organization_country: 'Organization country',
  organization_type: 'Organization type',
};

const formatFieldName = (field: string): string => {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ');
};

interface CompleteYourProfileBannerProps {
  missingFields?: string[];
}

export const CompleteYourProfileBanner = ({
  missingFields,
}: CompleteYourProfileBannerProps) => (
  <div className="h-60px bg-body border-bottom">
    <div className="container-fluid d-flex align-items-center h-100">
      <div className="d-flex align-items-center">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          className="me-2"
        />

        <p className="mb-0">
          <strong>{translate('Complete your profile.')}</strong>{' '}
          <span className="text-gray-500">
            {missingFields && missingFields.length > 0
              ? translate(
                  'Please fill in the following required fields: {fields}',
                  {
                    fields: missingFields.map(formatFieldName).join(', '),
                  },
                )
              : translate(
                  'To ensure full access to all platform features and services, please update your profile information to avoid service disruptions.',
                )}
          </span>
        </p>
      </div>
    </div>
  </div>
);
