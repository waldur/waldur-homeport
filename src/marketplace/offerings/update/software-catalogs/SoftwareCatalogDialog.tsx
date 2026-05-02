import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddSoftwareCatalog,
  marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate,
  NestedSoftwareCatalog,
  Offering,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { SoftwareCatalogForm } from './SoftwareCatalogForm';

type DialogMode = 'add' | 'edit';

interface SoftwareCatalogDialogProps {
  resolve: {
    mode: DialogMode;
    offering: Offering;
    softwareCatalog?: NestedSoftwareCatalog;
    refetch: () => Promise<void>;
  };
}

export const SoftwareCatalogDialog: FC<SoftwareCatalogDialogProps> = ({
  resolve,
}) => {
  const { mode, offering, softwareCatalog, refetch } = resolve;

  const getInitialValues = useCallback(() => {
    switch (mode) {
      case 'add':
        return {};
      case 'edit':
        return {
          catalog: softwareCatalog.catalog,
          enabled_cpu_family: softwareCatalog.enabled_cpu_family || [],
          enabled_cpu_microarchitectures:
            softwareCatalog.enabled_cpu_microarchitectures || [],
          partition_uuid: softwareCatalog?.partition?.uuid,
        };
      default:
        return {};
    }
  }, [mode, softwareCatalog]);

  const saveCatalogMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      switch (mode) {
        case 'add':
          return marketplaceProviderOfferingsAddSoftwareCatalog({
            path: { uuid: offering.uuid },
            body: {
              offering: offering.uuid,
              catalog: formData.catalog?.uuid || formData.catalog,
              enabled_cpu_family:
                formData.enabled_cpu_family?.map(
                  (arch) => arch.value || arch,
                ) || [],
              enabled_cpu_microarchitectures:
                formData.enabled_cpu_microarchitectures?.map(
                  (microarch) => microarch.value || microarch,
                ) || [],
              partition: formData.partition_uuid,
            },
          });
        case 'edit':
          return marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate(
            {
              path: { uuid: offering.uuid },
              body: {
                offering_catalog_uuid: softwareCatalog.uuid,
                enabled_cpu_family: formData.enabled_cpu_family || [],
                enabled_cpu_microarchitectures:
                  formData.enabled_cpu_microarchitectures || [],
                partition: formData.partition_uuid,
              },
            },
          );
        default:
          return Promise.reject(new Error('Invalid mode'));
      }
    },
    successMessage:
      mode === 'add'
        ? translate('Software catalog has been added.')
        : translate('Software catalog has been updated.'),
    errorMessage:
      mode === 'add'
        ? translate('Unable to add software catalog.')
        : translate('Unable to update software catalog.'),
    refetch,
  });

  const getDialogConfig = () => {
    switch (mode) {
      case 'add':
        return {
          title: translate('Add software catalog'),
          buttonLabel: translate('Add'),
          icon: <PlusCircleIcon weight="bold" />,
          iconColor: 'success' as const,
        };
      case 'edit':
        return {
          title: translate('Edit software catalog'),
          buttonLabel: translate('Update'),
          icon: <PencilSimpleIcon weight="bold" />,
          iconColor: 'warning' as const,
        };
    }
  };

  const config = getDialogConfig();

  const renderFormContent = () => {
    return (
      <SoftwareCatalogForm
        isEdit={mode === 'edit'}
        initialCatalog={mode === 'edit' ? softwareCatalog?.catalog : undefined}
        offering={offering}
      />
    );
  };

  const getFooter = (submitting: boolean, invalid: boolean) => {
    return (
      <SubmitButton
        disabled={invalid}
        submitting={submitting}
        label={config.buttonLabel}
      />
    );
  };

  return (
    <Form
      onSubmit={(values) => saveCatalogMutation.mutateAsync(values)}
      initialValues={getInitialValues()}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={config.title}
            footer={getFooter(submitting, invalid)}
            iconNode={config.icon}
            iconColor={config.iconColor}
          >
            {renderFormContent()}
          </ModalDialog>
        </form>
      )}
    />
  );
};
