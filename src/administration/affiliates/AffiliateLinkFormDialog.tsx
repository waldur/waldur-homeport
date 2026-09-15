import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CustomerAffiliate,
  customerAffiliatesCreate,
  customerAffiliatesList,
  customerAffiliatesPartialUpdate,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
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

import {
  AffiliateLinkFormData,
  getActiveAffiliateConflict,
  OrganizationOption,
  validateAffiliateLinkForm,
} from './utils';

interface OwnProps {
  resolve: {
    row?: CustomerAffiliate;
    refetch(): void;
  };
}

export const AffiliateLinkFormDialog: FC<OwnProps> = ({
  resolve: { row, refetch },
}) => {
  const isEdit = useMemo(() => Boolean(row?.uuid), [row]);

  const loadOrganizations = useMemo(
    () => organizationAutocomplete({ field: ['name', 'uuid', 'url'] }),
    [],
  );

  // An organization has at most one active affiliate, so organizations that
  // already have one are greyed out in the referred-organization picker.
  // Maps referred organization UUID to its current affiliate's name.
  const { data: activeAffiliates, isError: activeAffiliatesFailed } = useQuery({
    queryKey: ['affiliate-link-form', 'active-affiliates'],
    queryFn: async () => {
      const links = await getAllPages((page) =>
        customerAffiliatesList({
          query: { page, page_size: 200, is_active: true },
        }),
      );
      return new Map(
        links.map((link) => [link.customer_uuid, link.affiliate_name]),
      );
    },
    enabled: !isEdit,
    // Links change from the list behind this dialog; never trust a cached
    // copy from the previous opening.
    refetchOnMount: 'always',
  });

  const getReferredOrganizationLabel = (option: OrganizationOption) => {
    const affiliateName = activeAffiliates?.get(option.uuid);
    return affiliateName
      ? translate('{name} (already referred by {affiliate})', {
          name: option.name,
          affiliate: affiliateName,
        })
      : option.name;
  };

  // Re-created when the active links arrive, so final-form re-validates a
  // referred organization picked before they loaded.
  const validate = useCallback(
    (values: AffiliateLinkFormData) =>
      validateAffiliateLinkForm(values, activeAffiliates),
    [activeAffiliates],
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
      validate={validate}
      render={({ handleSubmit, submitting, invalid, values }) => (
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
                    getOptionLabel={getReferredOrganizationLabel}
                    isOptionDisabled={(option) =>
                      Boolean(
                        getActiveAffiliateConflict(
                          option.uuid,
                          values.is_active,
                          activeAffiliates,
                        ),
                      )
                    }
                    description={
                      activeAffiliatesFailed
                        ? translate(
                            'Existing affiliate links could not be loaded, so organizations that already have an active affiliate are not marked. Saving still checks this.',
                          )
                        : undefined
                    }
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
                    getOptionLabel={(option) =>
                      option.uuid === values.customer?.uuid
                        ? translate('{name} (the referred organization)', {
                            name: option.name,
                          })
                        : option.name
                    }
                    isOptionDisabled={(option) =>
                      option.uuid === values.customer?.uuid
                    }
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
