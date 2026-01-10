import { Row, Col } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import {
  externalLinksCreate,
  externalLinksPartialUpdate,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@waldur/core/api';
import { composeValidators, url, required } from '@waldur/core/validators';
import { StringField, TextField, FieldError, SubmitButton } from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { useInvalidateShortcuts } from './utils';

export const QuickShortcutForm = ({ resolve }) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const invalidateShortcuts = useInvalidateShortcuts();

  const isEdit = Boolean(resolve.shortcut);

  const initialValues = isEdit
    ? {
        name: resolve.shortcut.name,
        description: resolve.shortcut.description,
        link: resolve.shortcut.link,
        image: resolve.shortcut.image,
      }
    : undefined;

  const onSubmit = async (formValues) => {
    try {
      if (isEdit) {
        await externalLinksPartialUpdate({
          path: { uuid: resolve.shortcut.uuid },
          body: {
            name: formValues.name,
            description: formValues.description,
            link: formValues.link,
            image: fileSerializer(formValues.image),
          },
          ...formDataOptions,
        });
        showSuccess(translate('Quick shortcut has been updated'));
      } else {
        await externalLinksCreate({
          body: {
            name: formValues.name,
            description: formValues.description,
            link: formValues.link,
            image: fileSerializer(formValues.image),
          },
          ...formDataOptions,
        });
        showSuccess(translate('Quick shortcut has been created'));
      }
      closeDialog();
      await resolve.refetch();
      invalidateShortcuts();
    } catch (error) {
      showErrorResponse(
        error,
        isEdit
          ? translate('Unable to update the quick shortcut.')
          : translate('Unable to create a quick shortcut.'),
      );
    }
  };

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
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
            closeButton
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
            <FormGroup>
              <Field
                name="image"
                component={ImageField as any}
                description={translate('Minimum image size of 250x250 pixels')}
              />
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup label={translate('Name')} required>
                  <Field
                    name="name"
                    component={StringField as any}
                    placeholder={translate('Type a name')}
                    validate={required}
                  />
                  <Field
                    name="name"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup label={translate('Link')} required>
                  <Field
                    name="link"
                    component={StringField as any}
                    placeholder={translate('Add a link')}
                    validate={composeValidators(required, url)}
                  />
                  <Field
                    name="link"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup label={translate('Description')}>
              <Field
                name="description"
                component={TextField as any}
                placeholder={translate('Enter a description')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
