import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesUpdateOptions,
  Resource,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

interface MultiEditOptionsDialogOwnProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

export const MultiEditOptionsDialog: FC<MultiEditOptionsDialogOwnProps> = ({
  resolve,
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const submitRequest = (formData: { attributes }) => {
    return Promise.all(
      resolve.rows.map((row) =>
        marketplaceResourcesUpdateOptions({
          path: { uuid: row.uuid },
          body: { options: formData.attributes },
        }),
      ),
    )
      .then(() => {
        showSuccess(translate('Options have been updated'));
        resolve.refetch();
        closeDialog();
      })
      .catch((e) => {
        showErrorResponse(e, translate('Unable to update options.'));
        // Throw submit errors to the form ui
        return { attributes: e.options };
      });
  };

  // Fetch related offering
  const offeringQuery = useQuery({
    queryKey: ['resource-offering-options', resolve.rows[0].uuid],
    queryFn: () =>
      marketplaceResourcesOfferingRetrieve({
        path: { uuid: resolve.rows[0].uuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  return (
    <Form
      onSubmit={submitRequest}
      initialValues={
        resolve.rows.length === 1
          ? { attributes: { ...(resolve.rows[0].options as object) } }
          : null
      }
    >
      {({
        handleSubmit,
        submitting,
        modifiedSinceLastSubmit,
        hasValidationErrors,
        hasSubmitErrors,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit resource options')}
            iconNode={<PencilSimpleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={
                    hasValidationErrors ||
                    (hasSubmitErrors && !modifiedSinceLastSubmit) ||
                    offeringQuery.isLoading ||
                    !!offeringQuery.error
                  }
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            {offeringQuery.isLoading ? (
              <LoadingSpinner />
            ) : offeringQuery.error ? (
              <LoadingErred loadData={offeringQuery.refetch} className="mb-4" />
            ) : offeringQuery.data.resource_options.order.length ? (
              <OptionsForm
                options={offeringQuery.data.resource_options}
                finalForm
              />
            ) : (
              translate(
                'There are no resource options defined in the offering.',
              )
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
