import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { isVisible } from '@waldur/store/config';
import { connectAngularComponent } from '@waldur/store/connect';
import { formatRegistrationMethod, formatUserStatus } from '@waldur/user/support/utils';
import { User, UserDetails } from '@waldur/workspace/types';

import { Row } from './row';

export interface UserDetailsTableProps extends TranslateProps {
  user: UserDetails;
  currentUser: User;
  rowIsVisible: (feature: string) => boolean;
}

const PureUserDetailsTable = (props: UserDetailsTableProps) => {
  return (
    <Table responsive={true}>
      <tbody>
        <Row
          label={props.translate('Full name')}
          value={props.user.full_name}/>
        <Row
          label={props.translate('ID code')}
          value={props.user.civil_number}/>
        <Row
          label={props.translate('Phone numbers')}
          value={props.user.phone_number}/>
        <Row
          label={props.translate('E-mail')}
          value={props.user.email}/>
        {
          props.rowIsVisible('user.preferred_language') &&
          <Row
            label={props.translate('Preferred language')}
            value={props.user.preferred_language}/>
        }
        {
          props.rowIsVisible('user.competence') &&
          <Row
            label={props.translate('Competence')}
            value={props.user.competence}/>
        }
        <Row
          label={props.translate('Registration method')}
          value={formatRegistrationMethod(props.user.registration_method)}/>
        <Row
          label={props.translate('Date joined')}
          value={formatDateTime(props.user.date_joined)}/>
        <Row
          label={props.translate('Job position')}
          value={props.user.job_title}/>
        {(props.currentUser.is_staff || props.currentUser.is_support) &&
          <Row
            label={props.translate('Status')}
            value={formatUserStatus(props.user)}/>
        }
      </tbody>
    </Table>
  );
};

const enhance = compose(
  withTranslation,
  connect(state => ({
    rowIsVisible: feature => isVisible(state, feature),
  }))
);

export const UserDetailsTable = enhance(PureUserDetailsTable);
export default connectAngularComponent(UserDetailsTable, ['user']);
