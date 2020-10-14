import * as React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

import { showTermsOfServiceDialog } from './store/actions';

interface PureTermsOfServiceProps {
  name: string;
  offering_terms_of_service?: string;
  onClick(): void;
}

const PureTermsOfService = (props: PureTermsOfServiceProps) => (
  <Field
    name={props.name}
    component={AwesomeCheckboxField}
    label={
      <a onClick={props.onClick}>
        <i className="fa fa-external-link" /> {translate('Terms of Service')}
      </a>
    }
    marginRight={false}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (e) => {
    e.preventDefault();
    return dispatch(
      showTermsOfServiceDialog(ownProps.offering_terms_of_service),
    );
  },
});

export const TermsOfService = connect(
  undefined,
  mapDispatchToProps,
)(PureTermsOfService);
