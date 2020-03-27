import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import { useSelector, useDispatch } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { TemplateQuestions } from '@waldur/rancher/template/TemplateQuestions';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { loadData } from './utils';

export const TemplateDetail = () => {
  const { state, call } = useQuery(loadData);
  React.useEffect(call, []);

  const project = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'project'),
  );

  const namespace = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'namespace'),
  );

  const namespaces = React.useMemo(
    () =>
      project
        ? state.data.projects
            .find(p => p.name === project)
            .namespaces.map(({ name }) => name)
        : [],
    [project, state.data],
  );

  const dispatch = useDispatch();

  const createApplication = React.useCallback(
    async formData => {
      try {
        await post('/rancher-apps/', {
          name: formData.name,
          description: formData.description,
          version: formData.version,
          template_uuid: state.data.template.uuid,
          project_uuid: state.data.projects.find(p => p.name === project).uuid,
          namespace_uuid: state.data.namespaces.find(p => p.name === namespace)
            .uuid,
          answers: formData.answers,
        });
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to create application.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        return;
      }
      dispatch(showSuccess(translate('Application has been created.')));
    },
    [dispatch, state.data, namespace, project],
  );

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load application template details.')}</h3>;
  }

  if (!state.loaded) {
    return null;
  }

  return (
    <>
      <TemplateHeader {...state.data} />

      <PanelGroup
        accordion={true}
        id="application-template-form"
        defaultActiveKey="configuration"
      >
        {state.data.version.readme && (
          <Panel eventKey="readme">
            <Panel.Heading>
              <Panel.Title toggle={true}>{translate('Summary')}</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <FormattedMarkdown text={state.data.version.readme} />
            </Panel.Body>
          </Panel>
        )}
        <Panel eventKey="configuration">
          <Panel.Heading>
            <Panel.Title toggle={true}>
              {translate('Configuration')}
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible={true}>
            <TemplateQuestions
              questions={state.data.version.questions}
              versions={state.data.template.versions}
              projects={state.data.projectOptions}
              namespaces={namespaces}
              initialValues={state.data.initialValues}
              createApplication={createApplication}
            />
          </Panel.Body>
        </Panel>
      </PanelGroup>
    </>
  );
};

export default connectAngularComponent(TemplateDetail);
