import { Col, Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  externalLinksCreate,
  externalLinksPartialUpdate,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { composeValidators, url, required } from '@/core/validators';
import { ImageGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { SHORTCUTS_QUERY_KEY } from './utils';

export const QuickShortcutForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.shortcut);

  const initialValues = isEdit
    ? {
        name: resolve.shortcut.name,
        description: resolve.shortcut.description,
        link: resolve.shortcut.link,
        image: resolve.shortcut.image,
      }
    : undefined;

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) => {
      const payload = {
        name: formValues.name,
        description: formValues.description,
        link: formValues.link,
        image: fileSerializer(formValues.image),
      };

      if (isEdit) {
        return externalLinksPartialUpdate({
          path: { uuid: resolve.shortcut.uuid },
          body: payload,
          ...formDataOptions,
        });
      } else {
        return externalLinksCreate({
          body: payload,
          ...formDataOptions,
        });
      }
    },
    successMessage: isEdit
      ? translate('Quick shortcut has been updated')
      : translate('Quick shortcut has been created'),
    errorMessage: isEdit
      ? translate('Unable to update the quick shortcut.')
      : translate('Unable to create a quick shortcut.'),
    refetch: resolve.refetch,
    invalidateQueries: [{ queryKey: SHORTCUTS_QUERY_KEY }],
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) =>
        onSubmitMutation.mutateAsync(values).catch(() => {})
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit quick shortcut for {shortcut}', {
                    shortcut: resolve.shortcut.name,
                  })
                : translate('Create quick shortcut')
            }
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={isEdit ? translate('Update') : translate('Create')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <ImageGroup
              name="image"
              description={translate('Minimum image size of 250x250 pixels')}
            />

            <Row>
              <Col md={6}>
                <StringGroup
                  name="name"
                  label={translate('Name')}
                  required
                  validate={required}
                  placeholder={translate('Type a name')}
                />
              </Col>
              <Col md={6}>
                <StringGroup
                  name="link"
                  label={translate('Link')}
                  required
                  validate={composeValidators(required, url)}
                  placeholder={translate('Add a link')}
                />
              </Col>
            </Row>
            <TextGroup
              name="description"
              placeholder={translate('Enter a description')}
              label={translate('Description')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
