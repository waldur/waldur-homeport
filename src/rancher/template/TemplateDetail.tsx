import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector } from 'redux-form';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { TemplateQuestions } from '@waldur/rancher/template/TemplateQuestions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { loadData } from './utils';

export const TemplateDetail = () => {
  const {
    params: { templateUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useAsync(() => loadData(templateUuid, clusterUuid), [
    templateUuid,
    clusterUuid,
  ]);

  const project = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'project'),
  );

  const namespaces = React.useMemo(
    () =>
      project
        ? state.value.projects
            .find(p => p.name === project)
            .namespaces.map(({ name }) => name)
        : [],
    [project, state.value],
  );

  const dispatch = useDispatch();

  const createApplication = React.useCallback(
    async formData => {
      try {
        await post('/rancher-apps/', {
          name: formData.name,
          description: formData.description,
          version: formData.version,
          template_uuid: state.value.template.uuid,
          project_uuid: state.value.projects.find(p => p.name === project).uuid,
          namespace_name: formData.useNewNamespace
            ? formData.newNamespace
            : undefined,
          namespace_uuid: formData.useNewNamespace
            ? undefined
            : state.value.namespaces.find(p => p.name === formData.namespace)
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
    [dispatch, state.value, project],
  );

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load application template details.')}</h3>;
  }

  if (!state.value) {
    return null;
  }

  return (
    <>
      <TemplateHeader {...state.value} />

      <PanelGroup
        accordion={true}
        id="application-template-form"
        defaultActiveKey="configuration"
      >
        {state.value.version.readme && (
          <Panel eventKey="readme">
            <Panel.Heading>
              <Panel.Title toggle={true}>{translate('Summary')}</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <FormattedMarkdown text={state.value.version.readme} />
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
              questions={state.value.version.questions}
              versions={state.value.template.versions}
              projects={state.value.projectOptions}
              namespaces={namespaces}
              initialValues={state.value.initialValues}
              createApplication={createApplication}
            />
          </Panel.Body>
        </Panel>
      </PanelGroup>
    </>
  );
};
