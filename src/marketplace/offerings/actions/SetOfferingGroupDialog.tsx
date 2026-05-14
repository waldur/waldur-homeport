import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsSetOfferingGroup,
  OfferingGroup,
  ProviderOffering,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { AsyncSelectFieldFinal } from '@/form/AsyncSelectField';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { translate } from '@/i18n';
import { offeringGroupAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface SetOfferingGroupDialogProps {
  resolve: {
    offering: ProviderOffering;
    initialGroup?: { uuid: string; title: string } | null;
    refetch: () => void;
  };
}

interface FormValues {
  offering_group: OfferingGroup | null;
}

export const SetOfferingGroupDialog = ({
  resolve,
}: SetOfferingGroupDialogProps) => {
  const initialValues = useMemo<FormValues>(
    () => ({
      offering_group: resolve.initialGroup
        ? ({
            uuid: resolve.initialGroup.uuid,
            title: resolve.initialGroup.title,
          } as OfferingGroup)
        : null,
    }),
    [resolve.initialGroup],
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      marketplaceProviderOfferingsSetOfferingGroup({
        path: { uuid: resolve.offering.uuid! },
        body: {
          offering_group: values.offering_group?.uuid ?? null,
        },
      }),
    successMessage: translate('Offering group has been updated.'),
    errorMessage: translate('Unable to update the offering group.'),
    refetch: resolve.refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        return e.response.data;
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set offering group')}
            footer={
              <SubmitButton submitting={submitting} label={translate('Save')} />
            }
          >
            <FormContainerFinal submitting={submitting}>
              <AsyncSelectFieldFinal
                name="offering_group"
                label={translate('Offering group')}
                placeholder={translate('Select a group or leave empty…')}
                loadOptions={(query, prevOptions, page) =>
                  offeringGroupAutocomplete(query, prevOptions, page, {
                    customer_uuid: resolve.offering.customer_uuid,
                  })
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.title}
                isClearable
              />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
