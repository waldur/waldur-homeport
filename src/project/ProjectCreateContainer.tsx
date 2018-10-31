import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as api from './api';
import { ProjectCreateForm } from './ProjectCreateForm';

interface ProjectCreateProps extends InjectedFormProps, TranslateProps {
  customer: any;
  createProject: (project: any) => void;
  gotoProjectList: () => void;
}

class ProjectCreateComponent extends React.Component<ProjectCreateProps> {
  state = {
    loaded: false,
    erred: false,
    projectTypes: [],
    certifications: [],
  };

  componentDidMount() {
    Promise.all([
      api.loadProjectTypes(),
      api.loadCertifications(),
    ]).then(([projectTypes, certifications]) => {
      this.setState({
        projectTypes,
        certifications,
        loaded: true,
        erred: false,
      });
    }).catch(() => {
      this.setState({
        loaded: false,
        erred: true,
      });
    });
  }

  render() {
    if (this.state.erred) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load project types or certifications.')}
        </h3>
      );
    }
    if (!this.state.loaded) {
      return <LoadingSpinner/>;
    }
    return (
      <ProjectCreateForm
        {...this.props}
        projectTypes={this.state.projectTypes}
        certifications={this.state.certifications}
      />
    );
  }
}

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
  reduxForm({form: 'projectCreate'}),
);

const ProjectCreateContainer = enhance(ProjectCreateComponent);

export default connectAngularComponent(ProjectCreateContainer);
