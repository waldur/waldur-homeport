import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceOfferingTermsOfServiceCreate } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import {
  StringField,
  SubmitButton,
  SelectField,
  NumberField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { FormGroup } from '../../FormGroup';

import { TOS_FORM_ID } from './constants';

const addAsOptions = [
  { label: translate('Markdown'), value: 'markdown' },
  { label: translate('External link'), value: 'external_link' },
];

export const AddTosDialog = reduxForm<{}, { resolve: { offering; refetch } }>({
  form: TOS_FORM_ID,
  initialValues: {
    add_as: 'markdown',
    grace_period_days: 60,
  },
})((props) => {
  const dispatch = useDispatch();
  const addAsValue = useSelector(
    (state: any) => state.form[TOS_FORM_ID]?.values?.add_as || 'markdown',
  );
  const requiresReconsentValue = useSelector(
    (state: any) =>
      state.form[TOS_FORM_ID]?.values?.requires_reconsent || false,
  );

  const update = useCallback(
    async (formData) => {
      try {
        const body: any = {
          offering: props.resolve.offering.url,
          version: formData.version,
          is_active: formData.is_active || false,
          requires_reconsent: formData.requires_reconsent || false,
        };

        if (formData.add_as === 'markdown') {
          body.terms_of_service = formData.terms_of_service;
        } else {
          body.terms_of_service_link = formData.terms_of_service_link;
        }

        if (formData.requires_reconsent && formData.grace_period_days) {
          body.grace_period_days = formData.grace_period_days;
        }

        await marketplaceOfferingTermsOfServiceCreate({ body });
        dispatch(
          showSuccess(
            translate('Terms of service has been added successfully.'),
          ),
        );
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to add Terms of Service.'),
          ),
        );
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <ModalDialog
        title={translate('Add Terms of Service')}
        iconNode={<PlusCircleIcon weight="bold" />}
        footer={
          <div className="d-flex gap-3 justify-content-end mt-4">
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              className="btn btn-primary min-w-125px"
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Confirm')}
            />
          </div>
        }
      >
        <FormGroup label={translate('Version')} required={true}>
          <Field name="version" validate={required} component={StringField} />
        </FormGroup>

        <FormGroup label={translate('Add as')} required={true}>
          <Field
            name="add_as"
            component={SelectField}
            options={addAsOptions}
            simpleValue
          />
        </FormGroup>

        {addAsValue === 'markdown' ? (
          <FormGroup label={translate('Terms of Service')}>
            <div className="markdown-editor-wrapper">
              <Field name="terms_of_service" component={MarkdownEditor} />
            </div>
          </FormGroup>
        ) : (
          <FormGroup label={translate('External link')} required={true}>
            <Field
              name="terms_of_service_link"
              component={StringField}
              validate={required}
            />
          </FormGroup>
        )}

        <div className="mb-3">
          <Field
            name="is_active"
            component={AwesomeCheckboxField as any}
            label={translate('Is active')}
          />
        </div>

        <div className="mb-3">
          <Field
            name="requires_reconsent"
            component={AwesomeCheckboxField as any}
            label={translate('Requires re-consent')}
          />
        </div>

        {requiresReconsentValue && (
          <FormGroup
            label={translate('Grace period (days)')}
            help={translate(
              'Number of days before outdated consents are automatically revoked. Only applies when requires re-consent is enabled.',
            )}
            helpEnd
            description={translate(
              'After this period expires, user consents for outdated terms will be automatically revoked.',
            )}
          >
            <Field
              name="grace_period_days"
              component={NumberField}
              min={0}
              parse={(value) => (value === '' ? undefined : Number(value))}
            />
          </FormGroup>
        )}
      </ModalDialog>
    </form>
  );
});
