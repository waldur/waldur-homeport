import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCurrentCustomer } from '@waldur/store/currentCustomer';

import * as actions from './actions';
import * as api from './api';
import { ProjectCreateForm } from './ProjectCreateForm';

const mapStateToProps = state => ({
  customer: getCurrentCustomer(state),
});

const mapDispatchToProps = dispatch => ({
  createProject: data => actions.createProject(data, dispatch),
  gotoProjectList: () => actions.gotoProjectList(null, dispatch),
  loadProjectTypes: api.loadProjectTypes,
  loadCertifications: api.loadCertifications,
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  withTranslation,
  connector,
  reduxForm({form: 'projectCreate'}),
);

const ProjectCreateContainer = enhance(ProjectCreateForm);

export default connectAngularComponent(ProjectCreateContainer);
