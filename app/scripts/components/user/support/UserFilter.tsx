import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import Panel from '@waldur/core/Panel';
import { StringField, FormContainer } from '@waldur/form-react';
import { withTranslation } from '@waldur/i18n';

const PureUserFilter = props => (
  <Panel title={props.translate('Apply filters')}>
    <form>
      <FormContainer
        submitting={props.submitting}>
        <StringField
          label={props.translate('Full name')}
          name="full_name"/>
        <StringField
          label={props.translate('Native name')}
          name="native_name"/>
        <StringField
          label={props.translate('ID code')}
          name="civil_number"/>
        <StringField
          label={props.translate('Email')}
          name="email"/>
      </FormContainer>
    </form>
  </Panel>
);

const enhance = compose(
  withTranslation,
  reduxForm({form: 'userFilter'}),
);

export const UserFilter = enhance(PureUserFilter);
