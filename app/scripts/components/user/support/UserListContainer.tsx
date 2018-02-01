import { connect } from 'react-redux';
import { compose } from 'redux';
import { formValueSelector, reduxForm } from 'redux-form';

import UserList from './UserList';

const selector = formValueSelector('userFilter');
const mapStateToProps = state => ({
  userFilter: selector(state, 'full_name', 'native_name', 'civil_number', 'email'),
});
const connector = connect(mapStateToProps);
const enhance = compose(
  connector,
  reduxForm({form: 'userFilter'}),
);
export default enhance(UserList);
