import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { formatRegistrationMethod, formatUserStatus } from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { Row } from './Row';
import { userLanguageIsVisible, userCompetenceIsVisible, isVisibleForSupportOrStaff } from './selectors';

export interface UserDetailsTableProps extends TranslateProps {
  user: UserDetails;
  userLanguageIsVisible: boolean;
  userCompetenceIsVisible: boolean;
  isVisibleForSupportOrStaff: boolean;
}

const PureUserDetailsTable = (props: UserDetailsTableProps) => {
  return (
    <Table responsive={true} bordered={true}>
      <tbody>
        <Row
          label={props.translate('Full name')}
          value={props.user.full_name}
        />
        <Row
          label={props.translate('ID code')}
          value={props.user.civil_number}
        />
        <Row
          label={props.translate('Phone numbers')}
          value={props.user.phone_number}
        />
        <Row
          label={props.translate('E-mail')}
          value={props.user.email}
        />
        <Row
          label={props.translate('Preferred language')}
          value={props.user.preferred_language}
          isVisible={props.userLanguageIsVisible}
        />
        <Row
          label={props.translate('Competence')}
          value={props.user.competence}
          isVisible={props.userCompetenceIsVisible}
        />
        <Row
          label={props.translate('Registration method')}
          value={formatRegistrationMethod(props.user.registration_method)}
        />
        <Row
          label={props.translate('Date joined')}
          value={formatDateTime(props.user.date_joined)}
        />
        <Row
          label={props.translate('Job position')}
          value={props.user.job_title}
        />
        <Row
          label={props.translate('Status')}
          value={formatUserStatus(props.user)}
          isVisible={props.isVisibleForSupportOrStaff}
        />
      </tbody>
    </Table>
  );
};

const mapStateToProps = state => ({
  userLanguageIsVisible: userLanguageIsVisible(state),
  userCompetenceIsVisible: userCompetenceIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps),
);

export const UserDetailsTable = enhance(PureUserDetailsTable);
export default connectAngularComponent(UserDetailsTable, ['user']);
