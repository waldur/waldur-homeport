import { getById, get, getAll } from '@waldur/core/api';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

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

const getCluster = clusterUuid => getById('/rancher-clusters/', clusterUuid);

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

const refreshBreadcrumbs = (cluster, template) => {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.items = [
    {
      label: translate('Project workspace'),
      state: 'project.details',
    },
    {
      label: translate('Resources'),
      state: 'marketplace-project-resources',
      params: {
        category_uuid: cluster.marketplace_category_uuid,
      },
    },
    {
      label: cluster.name,
      state: 'resources.details',
      params: {
        resource_type: 'Rancher.Cluster',
        uuid: cluster.uuid,
        tab: 'catalogs',
      },
    },
    {
      label: translate('Application catalogues'),
    },
    {
      label: template.catalog_name,
      state: 'rancher-catalog-details',
      params: {
        clusterUuid: cluster.uuid,
        catalogUuid: template.catalog_uuid,
      },
    },
    {
      label: translate('Application templates'),
    },
  ];
  BreadcrumbsService.activeItem = template.name;
};

export const loadData = async (templateUuid, clusterUuid) => {
  const template: any = await getTemplate(templateUuid);
  const cluster: any = await getCluster(clusterUuid);
  refreshBreadcrumbs(cluster, template);
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
    useNewNamespace: namespaceOptions.length === 0,
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
