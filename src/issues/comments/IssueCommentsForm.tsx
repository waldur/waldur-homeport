import { FunctionComponent } from 'react';
import { InjectedFormProps } from 'redux-form';

import {
  CancelButton,
  FormContainer,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';

import * as constants from './constants';
import './IssueCommentsForm.scss';

interface PureIssueCommentsFormProps extends InjectedFormProps {
  submitting: boolean;
  uiDisabled: boolean;
  onCancel(): void;
  onSubmit(data: any): void;
}

export const IssueCommentsForm: FunctionComponent<PureIssueCommentsFormProps> =
  (props) => {
    const {
      submitting,
      uiDisabled,
      pristine,
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
          <div className="comments-form__controls mt-3">
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
