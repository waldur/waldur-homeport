import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customersPartialUpdate } from 'waldur-js-client';

import {
  fieldConfig,
  getRestrictionsArray,
  RestrictionField,
} from '@waldur/core/restrictions';
import { SubmitButton } from '@waldur/form';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { Customer } from '@waldur/workspace/types';

const FORM_ID = 'EditMembershipRestrictionsDialog';

interface FormData {
  value: string[] | string;
}

interface EditMembershipRestrictionsDialogProps {
  resolve: {
    customer: Customer;
    field: RestrictionField;
  };
}

export const EditMembershipRestrictionsDialog = reduxForm<
  FormData,
  EditMembershipRestrictionsDialogProps
>({
  form: FORM_ID,
})(({ resolve, handleSubmit, submitting, invalid, dirty }) => {
  const dispatch = useDispatch();
  const { field } = resolve;
  const config = fieldConfig[field];

  const processRequest = useCallback(
    async (values: FormData) => {
      try {
        // Ensure value is always an array (defensive check)
        let arrayValue: string[];
        if (Array.isArray(values.value)) {
          arrayValue = values.value.filter(Boolean);
        } else if (typeof values.value === 'string') {
          arrayValue = (values.value as string)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
        } else {
          arrayValue = [];
        }

        const response = await customersPartialUpdate({
          path: { uuid: resolve.customer.uuid },
          body: {
            [field]: arrayValue,
          },
        });
        dispatch(
          showSuccess(
            translate('Membership restrictions updated successfully.'),
          ),
        );
        if (response.data) {
          dispatch(setCurrentCustomer(response.data));
        }
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Failed to update membership restrictions.'),
          ),
        );
      }
    },
    [resolve.customer.uuid, field, dispatch],
  );

  return (
    <form onSubmit={handleSubmit(processRequest)}>
      <ModalDialog
        title={config.title}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary flex-equal"
              onClick={() => dispatch(closeModalDialog())}
            >
              {translate('Cancel')}
            </button>
            <SubmitButton
              disabled={invalid || !dirty}
              submitting={submitting}
              label={translate('Save')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <CommaSeparatedListField
            name="value"
            label={config.label}
            placeholder={config.placeholder}
            description={config.description}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});

export const getInitialValues = (
  customer: Customer,
  field: RestrictionField,
): FormData => ({
  value: getRestrictionsArray(customer[field]),
});
