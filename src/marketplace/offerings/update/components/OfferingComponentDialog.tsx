import { PlusCircleIcon } from '@phosphor-icons/react';
import { omit } from 'es-toolkit';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsCreateOfferingComponent,
  marketplaceProviderOfferingsUpdateOfferingComponent,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { OfferingDependentsWarning } from '@/marketplace/offerings/dependents/OfferingDependentsWarning';
import { useOfferingDependents } from '@/marketplace/offerings/dependents/useOfferingDependents';
import { getConflictDetail } from '@/marketplace/offerings/dependents/utils';
import {
  dropHiddenPrepaidSettings,
  formatComponent,
} from '@/marketplace/offerings/store/utils';
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
  const isBuiltin = isEdit && Boolean(resolve.component.is_builtin);
  // OpenStack tenant quotas also keep the plugin's name and unit.
  const labelsLocked = isBuiltin && resolve.offering.type === TENANT_TYPE;

  const initialValues = useMemo(
    () => (isEdit ? parseComponent(resolve.component, resolve.offering) : {}),
    [resolve.component, resolve.offering, isEdit],
  );

  // Which calls build on the component. Whether an edit breaks them depends
  // on the edit, so this only names them; the backend refuses a breaking
  // edit and says why.
  const { dependents } = useOfferingDependents(
    resolve.offering.uuid,
    'component_removed',
    { componentType: resolve.component?.type, enabled: isEdit },
  );
  const [conflict, setConflict] = useState<string>();

  const submitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const data = dropHiddenPrepaidSettings(
        formatComponent(formData, resolve.offering),
        resolve.component?.billing_type,
      );
      if (isEdit) {
        const payload = labelsLocked
          ? omit(data, ['name', 'measured_unit', 'type'])
          : isBuiltin
            ? omit(data, ['type'])
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
    onError: (error) => setConflict(getConflictDetail(error)),
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) =>
        submitMutation.mutateAsync(values).catch(() => {
          // Error is handled by useManagedMutation
        })
      }
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
                <CloseDialogButton className="min-w-[125px]" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Confirm')}
                  variant="primary"
                  className="min-w-[125px]"
                />
              </>
            }
          >
            <OfferingDependentsWarning
              dependents={
                dependents.length
                  ? [
                      ...dependents,
                      {
                        summary: translate(
                          'Changing its billing type or limit period, or lowering its maximum below what they allow, may be refused.',
                        ),
                        blocks: false,
                        blocks_staff: false,
                      },
                    ]
                  : []
              }
              conflict={conflict}
              className="mb-3"
            />
            <ComponentForm
              offering={resolve.offering}
              typeReadOnly={isBuiltin}
              labelsReadOnly={labelsLocked}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
