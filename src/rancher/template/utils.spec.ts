import { Question } from '../types';

import { groupQuestions, parseQuestions, parseVisibleQuestions } from './utils';

const DataDog: Question[] = require('./DataDog.json');
const MySQL: Question[] = require('./MySQL.json');

describe('Rancher application provision utils', () => {
  describe('groupQuestions', () => {
    it('groups questions', () => {
      expect(Object.keys(groupQuestions(DataDog))).toMatchSnapshot();
    });
  });

  describe('subquestions', () => {
    it('shows subquestions if condition is met', () => {
      const parsed = parseQuestions(MySQL);
      const visible = parseVisibleQuestions(parsed, { defaultImage: false });
      expect(
        visible.find(question => question.variable === 'image'),
      ).toBeTruthy();
    });

    it('hides subquestions if condition is not met', () => {
      const parsed = parseQuestions(MySQL);
      const visible = parseVisibleQuestions(parsed, { defaultImage: true });
      expect(
        visible.find(question => question.variable === 'image'),
      ).toBeFalsy();
    });
  });
});
