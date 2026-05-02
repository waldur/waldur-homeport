import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import {
  CategoryGroupRequest,
  marketplaceCategoryGroupsCreate,
  marketplaceCategoryGroupsPartialUpdate,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { ImageField } from '@/form/ImageField';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const GroupFromDialog = connect<
  {},
  {},
  { resolve: { categoryGroup?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.categoryGroup
    ? { ...ownProps.resolve.categoryGroup }
    : undefined,
}))(
  reduxForm<CategoryGroupRequest, { resolve: { categoryGroup?; refetch } }>({
    form: 'CategoryGroupForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.categoryGroup?.uuid);

    const { mutateAsync } = useManagedMutation<any, any, CategoryGroupRequest>({
      mutationFn: (values) =>
        isEdit
          ? marketplaceCategoryGroupsPartialUpdate({
              path: { uuid: props.resolve.categoryGroup.uuid },
              body: {
                title: values.title,
                description: values.description,
                icon: fileSerializer(values.icon),
              },
              ...formDataOptions,
            })
          : marketplaceCategoryGroupsCreate({
              body: {
                title: values.title,
                description: values.description,
                icon: fileSerializer(values.icon),
              },
              ...formDataOptions,
            }),
      successMessage: isEdit
        ? translate('The category group has been updated.')
        : translate('The category group has been created.'),
      errorMessage: isEdit
        ? translate('Unable to update category group.')
        : translate('Unable to create category group.'),
      refetch: props.resolve.refetch,
    });

    const processRequest = async (values: CategoryGroupRequest) => {
      try {
        await mutateAsync(values);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          throw new SubmissionError(e.response.data);
        }
      }
    };

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.categoryGroup.title,
                })
              : translate('Create category group')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <ImageField
              label={translate('Icon')}
              name="icon"
              initialValue={props.initialValues?.icon as any as string}
            />

            <StringField
              label={translate('Title')}
              name="title"
              required
              validate={required}
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
