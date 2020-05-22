import {
  getTemplate,
  getCluster,
  getTemplateVersion,
  getProjects,
} from '../api';
import { Template, Question } from '../types';

import { refreshBreadcrumbs } from './breadcrumbs';
import { FormData } from './types';

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

export const parseQuestions = (questions: Question[]) => {
  const questionsMap = questions.reduce((result, question) => ({
    ...result,
    [question.variable]: question,
  }));
  return questions.map(question => ({
    ...question,
    showSubquestionIf:
      question.showSubquestionIf === 'true'
        ? true
        : question.showSubquestionIf === 'false'
        ? false
        : undefined,
    subquestions: question.subquestions
      ? question.subquestions.map(subQuestion => ({
          ...subQuestion,
          group: question.group,
        }))
      : undefined,
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
  const namespaces = projects[0].namespaces;
  const initialValues = {
    version: template.default_version,
    project: projects[0],
    namespace: namespaces ? namespaces[0] : undefined,
    useNewNamespace: namespaces.length === 0,
  };
  const questions = parseQuestions(version.questions);

  return {
    template,
    version,
    projects,
    namespaces,
    initialValues,
    questions,
  };
};

// Taken from https://stackoverflow.com/questions/6842795/dynamic-deep-setting-for-a-javascript-object
export function getValue(obj, path) {
  if (!obj) {
    return;
  }
  const a = path.split('.');
  let o = obj;
  while (a.length) {
    const n = a.shift();
    if (!(n in o)) return;
    o = o[n];
  }
  return o;
}

const serializeAnswer = (question: Question, answers: object) => {
  const value = getValue(answers, question.variable);
  if (question.type === 'secret') {
    return value.id;
  } else {
    return value;
  }
};

export const serializeApplication = (
  formData: FormData,
  template: Template,
  visibleQuestions: Question[],
) => ({
  name: formData.name,
  description: formData.description,
  version: formData.version,
  template_uuid: template.uuid,
  project_uuid: formData.project.uuid,
  namespace_name: formData.useNewNamespace ? formData.newNamespace : undefined,
  namespace_uuid: formData.useNewNamespace
    ? undefined
    : formData.namespace.uuid,
  answers: visibleQuestions.reduce(
    (result, question) => ({
      ...result,
      [question.variable]: serializeAnswer(question, formData.answers),
    }),
    {},
  ),
});

export const parseVisibleQuestions = (
  questions: Question[],
  answers: object,
) => {
  if (!questions) {
    return [];
  }
  const result = [];
  const questionIsVisible = question => {
    if (typeof question.showIf !== 'object') {
      return true;
    }
    for (const variable in question.showIf) {
      const value = getValue(answers, variable);
      if (value === undefined && !question.showIf[variable]) {
        return true;
      }
      if (value !== question.showIf[variable]) {
        return false;
      }
    }
    return true;
  };
  questions.forEach(question => {
    if (questionIsVisible(question)) {
      result.push(question);
      if (answers && question.subquestions) {
        const answer = getValue(answers, question.variable);
        if (answer === question.showSubquestionIf) {
          question.subquestions.forEach(subQuestion => {
            result.push(subQuestion);
          });
        }
      }
    }
  });
  return result;
};
