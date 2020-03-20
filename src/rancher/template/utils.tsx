import { getById, get, getAll } from '@waldur/core/api';
import { $state } from '@waldur/core/services';

import { Question } from './types';

export const groupQuestions = (
  questions: Question[],
): Record<string, Question[]> =>
  questions.reduce(
    (groups, question) => ({
      ...groups,
      [question.group]: [...(groups[question.group] || []), question],
    }),
    {},
  );

export const groupByN = (n, data) => {
  const result = [];
  for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n));
  return result;
};

const getTemplate = templateUuid =>
  getById('/rancher-templates/', templateUuid);

const getTemplateVersion = (templateUuid, versionUuid) =>
  get(`/rancher-template-versions/${templateUuid}/${versionUuid}/`).then(
    response => response.data,
  );

const getProjects = clusterUuid =>
  getAll('/rancher-projects/', { params: { cluster_uuid: clusterUuid } });

export const loadData = async () => {
  const template: any = await getTemplate($state.params.templateUuid);
  const version = await getTemplateVersion(
    template.uuid,
    template.default_version,
  );
  const projects: any[] = await getProjects($state.params.clusterUuid);
  const projectOptions = projects.map(({ name }) => name);
  const namespaces = projects[0].namespaces;
  const namespaceOptions = namespaces.map(({ name }) => name);
  const initialValues = {
    version: template.default_version,
    project: projectOptions[0],
    namespace: namespaceOptions ? namespaceOptions[0] : undefined,
  };
  return {
    template,
    version,
    projects,
    projectOptions,
    namespaces,
    namespaceOptions,
    initialValues,
  };
};
