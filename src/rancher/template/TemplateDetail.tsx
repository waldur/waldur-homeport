import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo, useCallback, FunctionComponent } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormattedMarkdown } from '@waldur/core/FormattedMarkdown';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { useTitle } from '@waldur/navigation/title';
import { TemplateQuestions } from '@waldur/rancher/template/TemplateQuestions';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { createApp } from '../api';

import { getBreadcrumbs } from './breadcrumbs';
import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { FormData } from './types';
import { serializeApplication, parseVisibleQuestions, loadData } from './utils';

export const TemplateDetail: FunctionComponent = () => {
  const {
    params: { templateUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const router = useRouter();

  const state = useAsync(() => loadData(templateUuid, clusterUuid), [
    templateUuid,
    clusterUuid,
  ]);

  useBreadcrumbsFn(
    () =>
      state.value
        ? getBreadcrumbs(state.value.cluster, state.value.template)
        : [],
    [state.value],
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
    () => parseVisibleQuestions(questions, answers),
    [questions, answers],
  );

  const dispatch = useDispatch();

  const createApplication = useCallback(
    async (formData: FormData) => {
      try {
        await createApp(
          serializeApplication(
            formData,
            state.value.template,
            state.value.cluster.service_project_link,
            visibleQuestions,
          ),
        );
        router.stateService.go('resource-details', {
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
