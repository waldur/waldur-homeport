import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
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

import { createApp } from '../api';

import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { FormData } from './types';
import { serializeApplication, parseVisibleQuestions, loadData } from './utils';

export const TemplateDetail = () => {
  const {
    params: { templateUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const router = useRouter();

  const state = useAsync(() => loadData(templateUuid, clusterUuid), [
    templateUuid,
    clusterUuid,
  ]);

  const project = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'project'),
  );

  const namespaces = React.useMemo(() => project?.namespaces || [], [project]);

  const answers = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'answers'),
  );

  const questions = state.value?.questions;

  const visibleQuestions = React.useMemo(
    () => parseVisibleQuestions(questions, answers),
    [questions, answers],
  );

  const dispatch = useDispatch();

  const createApplication = React.useCallback(
    async (formData: FormData) => {
      try {
        await createApp(
          serializeApplication(
            formData,
            state.value.template,
            visibleQuestions,
          ),
        );
        router.stateService.go('resources.details', {
          uuid: clusterUuid,
          resource_type: 'Rancher.Cluster',
          tab: 'applications',
        });
      } catch (response) {
        const errorMessage = `${translate(
          'Unable to create application.',
        )} ${format(response)}`;
        dispatch(showError(errorMessage));
        return;
      }
      dispatch(showSuccess(translate('Application has been created.')));
    },
    [dispatch, router.stateService, clusterUuid, state.value, visibleQuestions],
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
              projects={state.value.projects}
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
