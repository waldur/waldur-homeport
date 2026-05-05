import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import {
  marketplaceTagsCreate,
  marketplaceTagsPartialUpdate,
  Tag,
  TagRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface OwnProps {
  resolve: { tag?: Tag; refetch: () => void };
}

export const TagFormDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: ownProps.resolve?.tag
    ? { ...ownProps.resolve.tag }
    : undefined,
}))(
  reduxForm<TagRequest, OwnProps>({
    form: 'TagForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.tag?.uuid);

    const tagMutation = useManagedMutation<any, any, TagRequest>({
      mutationFn: (values) =>
        isEdit
          ? marketplaceTagsPartialUpdate({
              path: { uuid: props.resolve.tag.uuid },
              body: {
                name: values.name,
                description: values.description,
              },
            })
          : marketplaceTagsCreate({
              body: {
                name: values.name,
                description: values.description,
              },
            }),
      successMessage: isEdit
        ? translate('The tag has been updated.')
        : translate('The tag has been created.'),
      errorMessage: isEdit
        ? translate('Unable to update tag.')
        : translate('Unable to create tag.'),
      refetch: props.resolve.refetch,
    });

    return (
      <form
        onSubmit={props.handleSubmit(async (values) => {
          try {
            await tagMutation.mutateAsync(values);
          } catch (e) {
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
            throw e;
          }
        })}
      >
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.tag.name,
                })
              : translate('Create tag')
          }
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <StringField
              label={translate('Name')}
              name="name"
              required
              validate={required}
              maxLength={150}
            />

            <TextField
              label={translate('Description')}
              name="description"
              required={false}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
