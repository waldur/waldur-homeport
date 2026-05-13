import { PlusCircleIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsCreateOfferingComponent,
  marketplaceProviderOfferingsUpdateOfferingComponent,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { formatComponent } from '@/marketplace/offerings/store/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { TENANT_TYPE } from '@/openstack/constants';

import { parseComponent } from '../utils';

import { ComponentForm } from './ComponentForm';

export const OfferingComponentDialog: FC<{
  resolve: { offering; component?; refetch };
}> = ({ resolve }) => {
  const isEdit = Boolean(resolve.component);

  const initialValues = useMemo(
    () => (isEdit ? parseComponent(resolve.component, resolve.offering) : {}),
    [resolve.component, resolve.offering, isEdit],
  );

  const submitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const data = formatComponent(formData, resolve.offering);
      if (isEdit) {
        const payload =
          resolve.offering.type === TENANT_TYPE && resolve.component.is_builtin
            ? omit(data, ['name', 'measured_unit', 'type'])
            : data;
        return marketplaceProviderOfferingsUpdateOfferingComponent({
          path: { uuid: resolve.offering.uuid },
          body: payload,
        });
      }
      return marketplaceProviderOfferingsCreateOfferingComponent({
        path: { uuid: resolve.offering.uuid },
        body: data,
      });
    },
    successMessage: isEdit
      ? translate('Billing component has been updated successfully.')
      : translate('Billing component has been created successfully.'),
    errorMessage: isEdit
      ? translate('Unable to update billing component.')
      : translate('Unable to create billing component.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit component') : translate('Add component')
            }
            iconNode={!isEdit ? <PlusCircleIcon weight="bold" /> : null}
            iconColor={!isEdit ? 'success' : null}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Confirm')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <ComponentForm offering={resolve.offering} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
