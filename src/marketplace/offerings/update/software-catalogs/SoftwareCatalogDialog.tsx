import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddSoftwareCatalog,
  marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate,
  NestedSoftwareCatalog,
  Offering,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
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

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        switch (mode) {
          case 'add':
            await marketplaceProviderOfferingsAddSoftwareCatalog({
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
            showSuccess(translate('Software catalog has been added.'));
            break;

          case 'edit':
            await marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate(
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
            showSuccess(translate('Software catalog has been updated.'));
            break;
        }

        await refetch();
        closeDialog();
      } catch (error) {
        const errorMessage = {
          add: translate('Unable to add software catalog.'),
          edit: translate('Unable to update software catalog.'),
        }[mode];
        showErrorResponse(error, errorMessage);
      }
    },
    [
      mode,
      offering,
      softwareCatalog,
      refetch,
      closeDialog,
      showSuccess,
      showErrorResponse,
    ],
  );

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
      onSubmit={handleSubmit}
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
