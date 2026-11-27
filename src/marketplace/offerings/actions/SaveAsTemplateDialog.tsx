import { CopySimpleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsSaveAsTemplate,
  ProviderOffering,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { toSubmitErrors } from '@/administration/offering-templates/templateDocument';
import { required } from '@/core/validators';
import { StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

interface SaveAsTemplateDialogProps {
  resolve: { offering: Pick<ProviderOffering, 'uuid' | 'name'> };
}

interface FormValues {
  name: string;
  description?: string;
}

export const SaveAsTemplateDialog: FC<SaveAsTemplateDialogProps> = ({
  resolve: { offering },
}) => {
  const router = useRouter();
  const { showSuccess } = useNotify();
  const initialValues = useMemo<FormValues>(
    () => ({ name: offering.name ?? '', description: '' }),
    [offering.name],
  );

  const mutation = useManagedMutation({
    mutationFn: (values: FormValues) =>
      marketplaceProviderOfferingsSaveAsTemplate({
        path: { uuid: offering.uuid },
        body: {
          name: values.name,
          // Left empty, the template takes the offering's description.
          ...(values.description ? { description: values.description } : {}),
        },
      }).then((response) => response.data),
    onSuccess: (template) =>
      showSuccess(
        translate('Offering template {name} created.', {
          name: template.name,
        }),
        translate(
          'It is unpublished: publish it from the offering templates page to offer it to service providers.',
        ),
        {
          actions: [
            {
              label: translate('Open offering templates'),
              onClick: () =>
                router.stateService.go('admin-marketplace-offerings', {
                  tab: 'templates',
                }),
              primary: true,
            },
          ],
        },
      ),
  });

  return (
    <Form<FormValues>
      onSubmit={(values) =>
        mutation
          .mutateAsync(values)
          .then(() => undefined)
          .catch((error) => toSubmitErrors(error, ['name', 'description']))
      }
      initialValues={initialValues}
      render={({
        handleSubmit,
        submitting,
        invalid,
        submitError,
        dirtySinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={<CopySimpleIcon weight="bold" />}
            title={translate('Save as template')}
            subtitle={translate(
              'Saves the offering, its components, plans and agent configuration as an offering template. Secrets, files, screenshots, organizations and resources are left out.',
            )}
            footer={
              <>
                <div className="min-w-dialog-action">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-full"
                  />
                </div>
                <div className="min-w-dialog-action">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    invalid={invalid}
                    label={translate('Save')}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            {submitError && !dirtySinceLastSubmit ? (
              <AlertItem
                variant="error"
                type="floating"
                className="mb-3"
                title={translate('Unable to save the offering as a template.')}
                body={submitError}
              />
            ) : null}
            <StringGroup
              name="name"
              validate={required}
              label={translate('Template name')}
              required
              maxLength={150}
            />
            <TextGroup
              name="description"
              label={translate('Description')}
              description={translate(
                "Shown to service providers choosing a template. Left empty, the offering's description is used.",
              )}
              rows={3}
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
