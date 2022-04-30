import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  SecretField,
  SelectField,
  SubmitButton,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import * as actions from '@waldur/user/support/actions';
import { userTokenIsVisible } from '@waldur/user/support/selectors';
import { UserDetails } from '@waldur/workspace/types';

import {
  TokenLifetimeTooltip,
  TokenLifetimeWarning,
  getTokenOptions,
} from './TokenLifetimeField';

interface UserEditTokenFormData {
  token: string;
  token_lifetime: number;
}

interface UserEditTokenComponentProps extends InjectedFormProps {
  user: UserDetails;
  updateUser(data: UserEditTokenFormData): Promise<void>;
  userTokenIsVisible: boolean;
}

const UserEditTokenComponent: React.FC<UserEditTokenComponentProps> = (
  props,
) => {
  return (
    <Card className="mb-6">
      <Card.Header>
        <Card.Title>
          <h3>{translate('API token')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(props.updateUser)}>
          <FormContainer
            submitting={props.submitting}
            labelClass="col-sm-3 col-md-2"
            controlClass="col-sm-6 col-md-5"
          >
            {props.userTokenIsVisible && (
              <SecretField name="token" label={translate('API token')} />
            )}
            {props.userTokenIsVisible && (
              <SelectField
                options={getTokenOptions()}
                name="token_lifetime"
                label={TokenLifetimeTooltip}
                getOptionLabel={(option) => option.name}
              />
            )}
            {props.userTokenIsVisible && <TokenLifetimeWarning />}
          </FormContainer>
          <Form.Group>
            <div className="pull-right">
              <FieldError error={props.error} />
              <SubmitButton
                className="btn btn-primary btn-metro btn-sm me-2"
                submitting={props.submitting}
                label={translate('Save changes')}
              />
            </div>
          </Form.Group>
        </form>
      </Card.Body>
    </Card>
  );
};

const mapStateToProps = (state, ownProps) => ({
  initialValues: {
    token: ownProps.user.token,
    token_lifetime: getTokenOptions().find(
      (option) => option.value === ownProps.user.token_lifetime,
    ),
  },
  userTokenIsVisible: userTokenIsVisible(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  let updateUser;
  if (ownProps.onSave) {
    updateUser = (data) => ownProps.onSave(data);
  } else {
    updateUser = (data) =>
      actions.updateUser(
        {
          ...data,
          uuid: ownProps.user.uuid,
        },
        dispatch,
      );
  }

  return {
    updateUser,
  };
};

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'userEditToken',
  }),
);

export const UserEditTokenContainer = enhance(UserEditTokenComponent);
