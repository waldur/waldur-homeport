import * as React from 'react';
import { connect } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { getCustomer } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as api from './api';
import { ProjectCreateForm } from './ProjectCreateForm';

interface ProjectCreateProps extends InjectedFormProps, TranslateProps {
  customer: any;
  createProject: (project: any) => void;
  gotoProjectList: () => void;
}

const loadData = async () => {
  const projectTypes = await api.loadProjectTypes();
  const certifications = await api.loadCertifications();
  return {
    projectTypes,
    certifications,
  };
};

const ProjectCreateComponent: React.FC<ProjectCreateProps> = props => {
  const { loading, error, value } = useAsync(loadData);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {props.translate('Unable to load project types or certifications.')}
      </h3>
    );
  }

  return (
    <ProjectCreateForm
      {...props}
      projectTypes={value.projectTypes}
      certifications={value.certifications}
    />
  );
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  enforceLatinName: getConfig(state).enforceLatinName,
});

const mapDispatchToProps = dispatch => ({
  createProject: data => actions.createProject(data, dispatch),
  gotoProjectList: () => actions.gotoProjectList(null, dispatch),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
  reduxForm({ form: 'projectCreate' }),
);

export const ProjectCreateContainer = enhance(ProjectCreateComponent);
