import {
  getTemplate,
  getCluster,
  getTemplateVersion,
  getProjects,
} from './api';
import { refreshBreadcrumbs } from './breadcrumbs';
import { Question, TemplateVersion } from './types';

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

export const groupByN = (n: number, data: any[]) => {
  const result = [];
  for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n));
  return result;
};

const parseQuestions = (version: TemplateVersion) => {
  const questionsMap = version.questions.reduce((result, question) => ({
    ...result,
    [question.variable]: question,
  }));
  const questions = version.questions.map(question => ({
    ...question,
    showIf:
      question.showIf && typeof question.showIf === 'string'
        ? question.showIf.split('&&').reduce((result, part) => {
            const [variable, value] = part.split('=');
            const variableType = questionsMap[variable].type;
            const parsedValue =
              variableType === 'boolean' ? value === 'true' : value;
            return { ...result, [variable]: parsedValue };
          }, {})
        : undefined,
  }));
  return questions;
};

export const loadData = async (templateUuid: string, clusterUuid: string) => {
  const template = await getTemplate(templateUuid);
  const cluster = await getCluster(clusterUuid);
  refreshBreadcrumbs(cluster, template);
  const version = await getTemplateVersion(
    template.uuid,
    template.default_version,
  );
  const projects = await getProjects(clusterUuid);
  const projectOptions = projects.map(({ name }) => name);
  const namespaces = projects[0].namespaces;
  const namespaceOptions = namespaces.map(({ name }) => name);
  const initialValues = {
    version: template.default_version,
    project: projectOptions[0],
    namespace: namespaceOptions ? namespaceOptions[0] : undefined,
    useNewNamespace: namespaceOptions.length === 0,
  };
  const questions = parseQuestions(version);

  return {
    template,
    version,
    projects,
    projectOptions,
    namespaces,
    namespaceOptions,
    initialValues,
    questions,
  };
};

// Taken from https://stackoverflow.com/questions/6842795/dynamic-deep-setting-for-a-javascript-object
export function getValue(obj, path) {
  const a = path.split('.');
  let o = obj;
  while (a.length) {
    const n = a.shift();
    if (!(n in o)) return;
    o = o[n];
  }
  return o;
}

export function setValue(obj, path, value) {
  const a = path.split('.');
  let o = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value;
  return obj;
}
