import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useAsync } from 'react-use';
import { rancherAppsCreate } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useTitle } from '@/navigation/title';
import { TemplateQuestions } from '@/rancher/template/TemplateQuestions';

import { TemplateHeader } from './TemplateHeader';
import { FormData } from './types';
import { loadData, parseVisibleQuestions, serializeApplication } from './utils';

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

  const { mutateAsync: createApplication } = useManagedMutation({
    mutationFn: async (formData: FormData) => {
      const questions = state.value?.questions || [];
      const visibleQuestions = parseVisibleQuestions(
        questions,
        formData.answers,
      );
      await rancherAppsCreate({
        body: serializeApplication(
          formData,
          state.value!.template,
          state.value!.cluster.service_settings,
          state.value!.cluster.project,
          visibleQuestions,
        ),
      });
    },
    successMessage: translate('Application has been created.'),
    errorMessage: translate('Unable to create application.'),
    closeModal: false,
  });

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
    <Form
      onSubmit={createApplication}
      initialValues={state.value.initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <TemplateHeader {...state.value!} />

          <Accordion
            id="application-template-form"
            defaultActiveKey="configuration"
          >
            {state.value!.version.readme && (
              <Accordion.Item eventKey="readme">
                <Card.Header>
                  <Card.Title>{translate('Summary')}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <SafeMarkdown text={state.value!.version.readme} />
                </Card.Body>
              </Accordion.Item>
            )}
            <Accordion.Item eventKey="configuration">
              <Card.Header>
                <Card.Title>{translate('Configuration')}</Card.Title>
              </Card.Header>
              <Card.Body>
                {(() => {
                  const project = values.project;
                  const answers = values.answers;
                  const namespaces = project?.namespaces || [];
                  const visibleQuestions = parseVisibleQuestions(
                    state.value!.questions,
                    answers,
                  );
                  return (
                    <TemplateQuestions
                      questions={visibleQuestions}
                      versions={state.value!.template.versions}
                      projects={state.value!.projects}
                      namespaces={namespaces}
                      submitting={submitting}
                      invalid={invalid}
                      createApplication={createApplication}
                    />
                  );
                })()}
              </Card.Body>
            </Accordion.Item>
          </Accordion>
        </form>
      )}
    />
  );
};
