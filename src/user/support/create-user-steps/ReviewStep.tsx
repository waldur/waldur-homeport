import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  formatGender,
  formatOrganizationType,
} from '@waldur/user/support/aai-constants';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { UserFormData, UserFormDialogData } from '../CreateUserDialog';

const ReviewRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <tr>
    <td className="fw-bold text-nowrap pe-4">{label}</td>
    <td>{renderFieldOrDash(value)}</td>
  </tr>
);

const BooleanLabel = ({ value }: { value: boolean }) => (
  <span className={value ? 'text-success' : 'text-muted'}>
    {value ? translate('Yes') : translate('No')}
  </span>
);

export const ReviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<UserFormData>();
  const { editMode } = (props.data || {}) as UserFormDialogData;

  return (
    <WizardModal {...props}>
      {editMode && (
        <p className="text-muted mb-4">
          {translate('Review the changes below and click Save to apply them.')}
        </p>
      )}
      <table className="table table-borderless mb-0">
        <tbody>
          <tr>
            <td
              colSpan={2}
              className="fw-bolder text-uppercase text-muted fs-7 pb-2 pt-0"
            >
              {translate('Account')}
            </td>
          </tr>
          <ReviewRow label={translate('Username')} value={values.username} />
          <ReviewRow label={translate('Email')} value={values.email} />
          <ReviewRow
            label={translate('Active')}
            value={<BooleanLabel value={values.is_active} />}
          />
          <ReviewRow
            label={translate('Staff')}
            value={<BooleanLabel value={values.is_staff} />}
          />
          <ReviewRow
            label={translate('Support')}
            value={<BooleanLabel value={values.is_support} />}
          />

          <tr>
            <td
              colSpan={2}
              className="fw-bolder text-uppercase text-muted fs-7 pb-2 pt-6"
            >
              {translate('Personal information')}
            </td>
          </tr>
          <ReviewRow
            label={translate('First name')}
            value={values.first_name}
          />
          <ReviewRow label={translate('Last name')} value={values.last_name} />
          {isProfileAttributeEnabled('native_name') && (
            <ReviewRow
              label={translate('Native name')}
              value={values.native_name}
            />
          )}
          <ReviewRow
            label={translate('Organization')}
            value={values.organization}
          />
          <ReviewRow
            label={translate('Job position')}
            value={values.job_title}
          />
          {isProfileAttributeEnabled('phone_number') && (
            <ReviewRow
              label={translate('Phone number')}
              value={values.phone_number}
            />
          )}
          <ReviewRow
            label={translate('Description')}
            value={values.description}
          />

          {(isProfileAttributeEnabled('personal_title') ||
            isProfileAttributeEnabled('gender') ||
            isProfileAttributeEnabled('place_of_birth') ||
            isProfileAttributeEnabled('country_of_residence') ||
            isProfileAttributeEnabled('nationality') ||
            isProfileAttributeEnabled('organization_country') ||
            isProfileAttributeEnabled('organization_type') ||
            isProfileAttributeEnabled('organization_registry_code')) && (
            <>
              <tr>
                <td
                  colSpan={2}
                  className="fw-bolder text-uppercase text-muted fs-7 pb-2 pt-6"
                >
                  {translate('Identity & Profile')}
                </td>
              </tr>
              {isProfileAttributeEnabled('personal_title') && (
                <ReviewRow
                  label={translate('Personal title')}
                  value={values.personal_title}
                />
              )}
              {isProfileAttributeEnabled('gender') && (
                <ReviewRow
                  label={translate('Gender')}
                  value={formatGender(values.gender)}
                />
              )}
              {isProfileAttributeEnabled('place_of_birth') && (
                <ReviewRow
                  label={translate('Place of birth')}
                  value={values.place_of_birth}
                />
              )}
              {isProfileAttributeEnabled('country_of_residence') && (
                <ReviewRow
                  label={translate('Country of residence')}
                  value={values.country_of_residence}
                />
              )}
              {isProfileAttributeEnabled('nationality') && (
                <ReviewRow
                  label={translate('Nationality')}
                  value={values.nationality}
                />
              )}
              {isProfileAttributeEnabled('nationalities') &&
                values.nationalities?.length > 0 && (
                  <ReviewRow
                    label={translate('Nationalities')}
                    value={values.nationalities.join(', ')}
                  />
                )}
              {isProfileAttributeEnabled('organization_country') && (
                <ReviewRow
                  label={translate('Organization country')}
                  value={values.organization_country}
                />
              )}
              {isProfileAttributeEnabled('organization_type') && (
                <ReviewRow
                  label={translate('Organization type')}
                  value={formatOrganizationType(values.organization_type)}
                />
              )}
              {isProfileAttributeEnabled('organization_registry_code') && (
                <ReviewRow
                  label={translate('Organization registry code')}
                  value={values.organization_registry_code}
                />
              )}
            </>
          )}
        </tbody>
      </table>
    </WizardModal>
  );
};
