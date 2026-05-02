import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo, useCallback, FunctionComponent } from 'react';
import { Card, Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';
import { rancherAppsCreate } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { TemplateQuestions } from '@/rancher/template/TemplateQuestions';
import { useNotify } from '@/store/notify';
import { type RootState } from '@/store/reducers';

import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { FormData } from './types';
import { serializeApplication, parseVisibleQuestions, loadData } from './utils';

export const TemplateDetail: FunctionComponent = () => {
  const {
    params: { templateUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useAsync(
    () => loadData(templateUuid, clusterUuid),
    [templateUuid, clusterUuid],
  );

  useTitle(
    state.value ? state.value.template.name : translate('Template details'),
  );

  const project = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'project'),
  );

  const namespaces = useMemo(() => project?.namespaces || [], [project]);

  const answers = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'answers'),
  );

  const questions = state.value?.questions;

  const visibleQuestions = useMemo(
    // @ts-ignore
    () => parseVisibleQuestions(questions, answers),
    [questions, answers],
  );

  const { showErrorResponse, showSuccess } = useNotify();

  const createApplication = useCallback(
    async (formData: FormData) => {
      try {
        await rancherAppsCreate({
          body: serializeApplication(
            formData,
            state.value.template,
            state.value.cluster.service_settings,
            state.value.cluster.project,
            visibleQuestions,
          ),
        });
      } catch (response) {
        showErrorResponse(response, translate('Unable to create application.'));
        return;
      }
      showSuccess(translate('Application has been created.'));
    },
    [clusterUuid, visibleQuestions],
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

      <Accordion
        id="application-template-form"
        defaultActiveKey="configuration"
      >
        {state.value.version.readme && (
          <Accordion.Item eventKey="readme">
            <Card.Header>
              <Card.Title>{translate('Summary')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <SafeMarkdown text={state.value.version.readme} />
            </Card.Body>
          </Accordion.Item>
        )}
        <Accordion.Item eventKey="configuration">
          <Card.Header>
            <Card.Title>{translate('Configuration')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <TemplateQuestions
              questions={visibleQuestions}
              versions={state.value.template.versions}
              projects={state.value.projects}
              namespaces={namespaces}
              initialValues={state.value.initialValues}
              createApplication={createApplication}
            />
          </Card.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};
