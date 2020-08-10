import {
  getTemplate,
  getCluster,
  getTemplateVersion,
  getProjects,
} from '../api';
import { Template, Question, QuestionType } from '../types';

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

export const buildQuestionTypeMap = (
  questions: Question[],
): Record<string, QuestionType> => {
  const questionTypeMap = {};
  questions.forEach((question) => {
    questionTypeMap[question.variable] = question.type;
    if (Array.isArray(question.subquestions)) {
      question.subquestions.forEach((subQuestion) => {
        questionTypeMap[subQuestion.variable] = subQuestion.type;
      });
    }
  });
  return questionTypeMap;
};

const parseShowIf = (
  question: Question,
  questionTypeMap: Record<string, QuestionType>,
): Record<string, string | boolean> =>
  question.showIf && typeof question.showIf === 'string'
    ? question.showIf.split('&&').reduce((result, part) => {
        const [variable, value] = part.split('=');
        const variableType = questionTypeMap[variable];
        const parsedValue =
          variableType === 'boolean' ? value === 'true' : value;
        return { ...result, [variable]: parsedValue };
      }, {})
    : undefined;

export const parseQuestions = (questions: Question[]) => {
  const questionTypeMap = buildQuestionTypeMap(questions);
  return questions.map((question) => ({
    ...question,
    showSubquestionIf:
      question.showSubquestionIf === 'true'
        ? true
        : question.showSubquestionIf === 'false'
        ? false
        : undefined,
    subquestions: question.subquestions
      ? question.subquestions.map((subQuestion) => ({
          ...subQuestion,
          group: question.group,
          showIf: parseShowIf(subQuestion, questionTypeMap),
        }))
      : undefined,
    showIf: parseShowIf(question, questionTypeMap),
  }));
};

export const loadData = async (templateUuid: string, clusterUuid: string) => {
  const template = await getTemplate(templateUuid);
  const cluster = await getCluster(clusterUuid);
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
  const questions = parseQuestions(version.questions || []);

  return {
    cluster,
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
  if (value && question.type === 'secret') {
    return value.id;
  } else {
    return value;
  }
};

export const serializeApplication = (
  formData: FormData,
  template: Template,
  service_project_link: string,
  visibleQuestions: Question[],
) => ({
  name: formData.name,
  description: formData.description,
  version: formData.version,
  template: template.url,
  service_project_link,
  rancher_project: formData.project.url,
  namespace_name: formData.useNewNamespace ? formData.newNamespace : undefined,
  namespace: formData.useNewNamespace ? undefined : formData.namespace.url,
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
  const questionIsVisible = (question) => {
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
  questions.forEach((question) => {
    if (questionIsVisible(question)) {
      result.push(question);
      if (answers && question.subquestions) {
        const answer = getValue(answers, question.variable);
        if (answer === question.showSubquestionIf) {
          question.subquestions.forEach((subQuestion) => {
            result.push(subQuestion);
          });
        }
      }
    }
  });
  return result;
};
