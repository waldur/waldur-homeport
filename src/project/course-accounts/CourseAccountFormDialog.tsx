import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  CourseAccountRequest,
  marketplaceCourseAccountsCreate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';

interface OwnProps {
  resolve: {
    refetch(): void;
  };
}

export const CourseAccountFormDialog: FC<OwnProps> = ({
  resolve: { refetch },
}) => {
  const project = useSelector(getProject);
  const dispatch = useDispatch();

  const save = useCallback(
    async (formData: CourseAccountRequest) => {
      try {
        await marketplaceCourseAccountsCreate({
          body: formData,
        });
        dispatch(closeModalDialog());

        dispatch(showSuccess(translate('Course account has been created.')));
        if (refetch) refetch();
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create course account.')),
        );
      }
    },
    [dispatch, refetch],
  );

  return (
    <Form
      onSubmit={save}
      initialValues={{ project: project.uuid }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create course account')}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            closeButton
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('Email')} required>
              <Field
                component={EmailField as any}
                name="email"
                placeholder={translate('e.g.') + ' Courseaccount@example.com'}
                validate={required}
              />
            </FormGroup>
            <FormGroup label={translate('Description')}>
              <Field
                component={TextField as any}
                name="description"
                placeholder={translate('e.g. Used for automated backups')}
                spaceless
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
