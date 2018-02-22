import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import Panel from '@waldur/core/Panel';
import { StringField, FormContainer } from '@waldur/form-react';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';

interface UserFilterProps extends TranslateProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter = (props: UserFilterProps) => (
  <Panel title={props.translate('Apply filters')}>
    <form>
      <FormContainer
        submitting={props.submitting}>
        <StringField
          label={props.translate('Full name')}
          name="full_name"/>
        {props.nativeNameVisible && (
          <StringField
            label={props.translate('Native name')}
            name="native_name"/>
        )}
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

const mapStateToProps = state => ({
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  withTranslation,
  reduxForm({form: 'userFilter'}),
  connect(mapStateToProps),
);

export const UserFilter = enhance(PureUserFilter);
