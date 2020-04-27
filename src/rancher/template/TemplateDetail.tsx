import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { TemplateQuestions } from '@waldur/rancher/template/TemplateQuestions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { createApp } from './api';
import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { loadData, setValue, getValue } from './utils';

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

  const answers = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'answers'),
  );

  const questions = state?.value?.questions;

  const visibleQuestions = React.useMemo(() => {
    if (!questions) {
      return [];
    }
    return questions.filter(question => {
      if (!question.showIf) {
        return true;
      }
      for (const variable in question.showIf) {
        const value = variable
          .split('.')
          .reduce(
            (result, item) => (result === undefined ? undefined : result[item]),
            answers,
          );
        if (value === undefined && !question.showIf[variable]) {
          return true;
        }
        if (value !== question.showIf[variable]) {
          return false;
        }
      }
      return true;
    });
  }, [answers, questions]);

  const dispatch = useDispatch();

  const createApplication = React.useCallback(
    async formData => {
      try {
        await createApp({
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
          answers: visibleQuestions.reduce(
            (result, question) => ({
              ...result,
              ...setValue(
                result,
                question.variable,
                getValue(formData.answers, question.variable),
              ),
            }),
            {},
          ),
        });
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to create application.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        throw error;
      }
      dispatch(showSuccess(translate('Application has been created.')));
    },
    [dispatch, state.value, project, visibleQuestions],
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
              questions={visibleQuestions}
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
