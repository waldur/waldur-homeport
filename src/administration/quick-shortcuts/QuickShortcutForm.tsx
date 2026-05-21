import { Row, Col } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import {
  externalLinksCreate,
  externalLinksPartialUpdate,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { composeValidators, url, required } from '@/core/validators';
import { StringField, TextField, FieldError, SubmitButton } from '@/form';
import { ImageField } from '@/form/ImageField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
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
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
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
            <FormGroup>
              <Field
                name="image"
                component={ImageField}
                description={translate('Minimum image size of 250x250 pixels')}
              />
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup label={translate('Name')} required>
                  <Field
                    name="name"
                    component={StringField}
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
                    component={StringField}
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
                component={TextField}
                placeholder={translate('Enter a description')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
