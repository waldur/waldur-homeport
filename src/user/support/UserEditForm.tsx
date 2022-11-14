import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { StaticField } from '@waldur/user/support/StaticField';
import { formatUserStatus } from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { EmailField } from './EmailField';
import { TermsOfService } from './TermsOfService';

interface UserEditFormData {
  full_name: string;
  email: string;
  user_status?: string;
  id_code?: string;
  organization: string;
  job_position: string;
  description: string;
  phone_number: string;
}

interface UserEditFormProps extends InjectedFormProps {
  updateUser(data: UserEditFormData): Promise<void>;
  initial?: boolean;
  isVisibleForSupportOrStaff: boolean;
  fieldIsVisible: (field: string) => boolean;
  isRequired: (field: string) => boolean;
  nativeNameIsVisible: () => boolean;
  user: UserDetails;
  fieldIsProtected(field: string): boolean;
}

export const PureUserEditForm: FunctionComponent<UserEditFormProps> = (
  props,
) => (
  <form onSubmit={props.handleSubmit(props.updateUser)}>
    <FormContainer submitting={props.submitting} floating={true}>
      <EmailField
        user={props.user}
        protected={props.fieldIsProtected('email')}
      />
      {!props.fieldIsProtected('full_name') && (
        <StringField
          name="full_name"
          label={translate('Full name')}
          required={props.isRequired('full_name')}
        />
      )}

      {props.nativeNameIsVisible && !props.fieldIsProtected('native_name') && (
        <StringField
          label={translate('Native name')}
          name="native_name"
          required={props.isRequired('native_name')}
        />
      )}
      {props.nativeNameIsVisible && props.fieldIsProtected('native_name') && (
        <StaticField
          label={translate('Native name')}
          value={props.user.native_name}
          protected
          disabled
        />
      )}
      {props.isVisibleForSupportOrStaff && (
        <StaticField
          label={translate('User status')}
          value={formatUserStatus(props.user)}
          disabled
        />
      )}
      {props.user.civil_number && (
        <StaticField
          label={translate('ID code')}
          value={props.user.civil_number}
          disabled
        />
      )}
      {props.fieldIsVisible('organization') &&
        !props.fieldIsProtected('organization') && (
          <StringField
            label={translate('Organization name')}
            name="organization"
            required={props.isRequired('organization')}
          />
        )}
      {props.fieldIsVisible('organization') &&
        props.fieldIsProtected('organization') && (
          <StaticField
            label={translate('Organization name')}
            value={props.user.organization}
            disabled
            protected
          />
        )}
      {props.fieldIsVisible('job_title') &&
        !props.fieldIsProtected('job_title') && (
          <StringField
            label={translate('Job position')}
            name="job_title"
            required={props.isRequired('job_title')}
          />
        )}
      {props.fieldIsVisible('job_title') &&
        props.fieldIsProtected('job_title') && (
          <StaticField
            label={translate('Job position')}
            value={props.user.job_title}
            disabled
            protected
          />
        )}
      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <StaticField
          label={translate('Affiliations')}
          value={props.user.affiliations.join(', ')}
          disabled
          protected
        />
      ) : null}
      {props.isVisibleForSupportOrStaff && (
        <StringField
          label={translate('Description')}
          name="description"
          required={props.isRequired('description')}
        />
      )}
      {props.fieldIsVisible('phone_number') &&
        !props.fieldIsProtected('phone_number') && (
          <StringField
            label={translate('Phone number')}
            name="phone_number"
            required={props.isRequired('phone_number')}
          />
        )}
      {props.fieldIsVisible('phone_number') &&
        props.fieldIsProtected('phone_number') && (
          <StaticField
            label={translate('Phone number')}
            value={props.user.phone_number}
            disabled
            protected
          />
        )}
      <hr />
      <ImageField name="image" initialValue={props.user.image} />
      <TermsOfService
        initial={props.initial}
        agreementDate={props.user.agreement_date}
      />
    </FormContainer>
    <Form.Group>
      <div className="pull-right">
        <FieldError error={props.error} />
        {props.dirty && (
          <Button
            variant="secondary"
            size="sm"
            className="me-2"
            onClick={props.reset}
          >
            {translate('Discard')}
          </Button>
        )}
        {!props.initial ? (
          props.dirty ? (
            <SubmitButton
              className="btn btn-primary btn-sm me-2"
              submitting={props.submitting}
              label={translate('Save changes')}
            />
          ) : null
        ) : (
          <SubmitButton
            submitting={props.submitting}
            label={translate('Agree and proceed')}
          />
        )}
      </div>
    </Form.Group>
  </form>
);

const enhance = reduxForm({
  form: 'userEdit',
});

export const UserEditForm = enhance(PureUserEditForm);
