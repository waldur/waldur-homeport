import { FunctionComponent } from 'react';
import { InjectedFormProps } from 'redux-form';

import {
  CancelButton,
  FormContainer,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import * as constants from './constants';
import './IssueCommentsForm.scss';

interface PureIssueCommentsFormProps extends TranslateProps, InjectedFormProps {
  submitting: boolean;
  uiDisabled: boolean;
  onCancel(): void;
  onSubmit(data: any): void;
}

export const PureIssueCommentsForm: FunctionComponent<PureIssueCommentsFormProps> = (
  props,
) => {
  const {
    submitting,
    uiDisabled,
    pristine,
    translate,
    onCancel,
    handleSubmit,
    onSubmit,
  } = props;

  return (
    <div className="comments-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormContainer submitting={submitting} clearOnUnmount={false}>
          <TextField name={constants.FORM_FIELDS.comment} />
        </FormContainer>
        <div className="comments-form__controls m-t-md">
          <SubmitButton
            submitting={submitting}
            disabled={uiDisabled || pristine}
            label={translate('Add')}
          />
          <CancelButton onClick={onCancel} label={translate('Cancel')} />
        </div>
      </form>
    </div>
  );
};

export const IssueCommentsForm = withTranslation(PureIssueCommentsForm);
