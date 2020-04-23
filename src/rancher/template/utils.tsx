import { getById, get, getAll } from '@waldur/core/api';

import { Question } from './types';

export const groupQuestions = (
  questions: Question[],
): Record<string, Question[]> =>
  questions.reduce(
    (groups, question) => ({
      ...groups,
      [question.group || '']: [
        ...(groups[question.group || ''] || []),
        question,
      ],
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

interface TemplateVersion {
  readme: string;
  questions: Question[];
}

const getTemplateVersion = (templateUuid, versionUuid) =>
  get<TemplateVersion>(
    `/rancher-template-versions/${templateUuid}/${versionUuid}/`,
  ).then(response => response.data);

const getProjects = clusterUuid =>
  getAll('/rancher-projects/', { params: { cluster_uuid: clusterUuid } });

export const loadData = async (templateUuid, clusterUuid) => {
  const template: any = await getTemplate(templateUuid);
  const version = await getTemplateVersion(
    template.uuid,
    template.default_version,
  );
  const projects: any[] = await getProjects(clusterUuid);
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
