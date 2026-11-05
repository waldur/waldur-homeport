import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
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

  const state = useQuery({
    queryKey: ['TemplateDetail', templateUuid, clusterUuid],
    queryFn: () => loadData(templateUuid, clusterUuid),
  });

  useTitle(
    state.data ? state.data.template.name : translate('Template details'),
  );

  const { mutateAsync: createApplication } = useManagedMutation({
    mutationFn: async (formData: FormData) => {
      const questions = state.data?.questions || [];
      const visibleQuestions = parseVisibleQuestions(
        questions,
        formData.answers,
      );
      await rancherAppsCreate({
        body: serializeApplication(
          formData,
          state.data!.template,
          state.data!.cluster.service_settings,
          state.data!.cluster.project,
          visibleQuestions,
        ),
      });
    },
    successMessage: translate('Application has been created.'),
    errorMessage: translate('Unable to create application.'),
    closeModal: false,
  });

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load application template details.')}</h3>;
  }

  if (!state.data) {
    return null;
  }

  return (
    <Form
      onSubmit={createApplication}
      initialValues={state.data.initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <TemplateHeader {...state.data!} />

          {/* Always-expanded sections in one bordered box, split by a rule. */}
          <div
            id="application-template-form"
            className="border border-secondary rounded-lg bg-primary"
          >
            {state.data!.version.readme && (
              <div>
                <div className="border-b border-secondary px-[var(--card-spacer)] py-[var(--card-header-py)]">
                  <div className="mb-[var(--card-title-spacer-y)]">
                    {translate('Summary')}
                  </div>
                </div>
                <div className="p-[var(--card-spacer)]">
                  <SafeMarkdown text={state.data!.version.readme} />
                </div>
              </div>
            )}
            <div
              className={
                state.data!.version.readme
                  ? 'border-t border-t-secondary'
                  : undefined
              }
            >
              <div className="border-b border-secondary px-[var(--card-spacer)] py-[var(--card-header-py)]">
                <div className="mb-[var(--card-title-spacer-y)]">
                  {translate('Configuration')}
                </div>
              </div>
              <div className="p-[var(--card-spacer)]">
                {(() => {
                  const project = values.project;
                  const answers = values.answers;
                  const namespaces = project?.namespaces || [];
                  const visibleQuestions = parseVisibleQuestions(
                    state.data!.questions,
                    answers,
                  );
                  return (
                    <TemplateQuestions
                      questions={visibleQuestions}
                      versions={state.data!.template.versions}
                      projects={state.data!.projects}
                      namespaces={namespaces}
                      submitting={submitting}
                      invalid={invalid}
                      createApplication={createApplication}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </form>
      )}
    />
  );
};
