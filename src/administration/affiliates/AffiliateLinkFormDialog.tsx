import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CustomerAffiliate,
  customerAffiliatesCreate,
  customerAffiliatesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  DateGroup,
  NumberGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface OwnProps {
  resolve: {
    row?: CustomerAffiliate;
    refetch(): void;
  };
}

interface OrganizationOption {
  url: string;
  name: string;
  uuid: string;
}

interface AffiliateLinkFormData {
  // On create these hold the selected organization option object (the raw
  // AsyncSelect stores the whole option); the backend expects the org URL.
  customer?: OrganizationOption;
  affiliate?: OrganizationOption;
  customer_name?: string;
  affiliate_name?: string;
  fee_percent?: number | string;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

const validateForm = (values: AffiliateLinkFormData) => {
  const errors: Record<string, string> = {};
  if (
    values.start_date &&
    values.end_date &&
    values.end_date <= values.start_date
  ) {
    errors.end_date = translate('End date must be after the start date.');
  }
  return errors;
};

export const AffiliateLinkFormDialog: FC<OwnProps> = ({
  resolve: { row, refetch },
}) => {
  const isEdit = useMemo(() => Boolean(row?.uuid), [row]);

  const loadOrganizations = useMemo(
    () => organizationAutocomplete({ field: ['name', 'uuid', 'url'] }),
    [],
  );

  const initialValues = useMemo<AffiliateLinkFormData>(
    () =>
      isEdit
        ? {
            customer_name: row.customer_name,
            affiliate_name: row.affiliate_name,
            fee_percent: row.fee_percent,
            is_active: row.is_active,
            start_date: row.start_date,
            end_date: row.end_date,
          }
        : { is_active: true },
    [isEdit, row],
  );

  const submitMutation = useManagedMutation({
    mutationFn: (formData: AffiliateLinkFormData) => {
      const feePercent =
        formData.fee_percent != null && formData.fee_percent !== ''
          ? String(formData.fee_percent)
          : undefined;
      if (isEdit) {
        return customerAffiliatesPartialUpdate({
          path: { uuid: row.uuid },
          body: {
            fee_percent: feePercent,
            is_active: formData.is_active,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          },
        });
      }
      return customerAffiliatesCreate({
        body: {
          customer: formData.customer?.url as string,
          affiliate: formData.affiliate?.url as string,
          fee_percent: feePercent,
          is_active: formData.is_active,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        },
      });
    },
    successMessage: isEdit
      ? translate('Affiliate link has been updated.')
      : translate('Affiliate link has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update the affiliate link.')
      : translate('Unable to create the affiliate link.'),
    refetch,
  });

  return (
    <Form<AffiliateLinkFormData>
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      validate={validateForm}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit affiliate link')
                : translate('Create affiliate link')
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <div className="size-sm">
              {isEdit ? (
                <>
                  <StringGroup
                    name="customer_name"
                    label={translate('Referred organization')}
                    disabled
                  />
                  <StringGroup
                    name="affiliate_name"
                    label={translate('Affiliate organization')}
                    disabled
                  />
                </>
              ) : (
                <>
                  <AsyncSelectGroup
                    name="customer"
                    label={translate('Referred organization')}
                    required
                    validate={required}
                    loadOptions={loadOrganizations}
                    getOptionValue={(option) => option.url}
                    getOptionLabel={(option) => option.name}
                    noOptionsMessage={() => translate('No organizations')}
                    isDisabled={submitting}
                  />
                  <AsyncSelectGroup
                    name="affiliate"
                    label={translate('Affiliate organization')}
                    required
                    validate={required}
                    loadOptions={loadOrganizations}
                    getOptionValue={(option) => option.url}
                    getOptionLabel={(option) => option.name}
                    noOptionsMessage={() => translate('No organizations')}
                    isDisabled={submitting}
                  />
                </>
              )}

              <NumberGroup
                name="fee_percent"
                label={translate('Fee percent')}
                min={0}
                max={100}
                unit="%"
                required
                validate={required}
                disabled={submitting}
              />

              <BooleanGroup
                name="is_active"
                label={translate('Active')}
                disabled={submitting}
              />

              <div className="row">
                <div className="col-sm-6">
                  <DateGroup
                    name="start_date"
                    label={translate('Start date')}
                    disabled={submitting}
                  />
                </div>
                <div className="col-sm-6">
                  <DateGroup
                    name="end_date"
                    label={translate('End date')}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
