import { Question } from '../types';

import DataDog from './DataDog.json';
import JFrog from './JFrog.json';
import MySQL from './MySQL.json';
import { groupQuestions, parseQuestions, parseVisibleQuestions } from './utils';

describe('Rancher application provision utils', () => {
  describe('groupQuestions', () => {
    it('groups questions', () => {
      expect(
        Object.keys(groupQuestions(DataDog as Question[])),
      ).toMatchSnapshot();
    });
  });

  describe('subquestions', () => {
    it('shows subquestions if condition is met', () => {
      const parsed = parseQuestions(MySQL as Question[]);
      const visible = parseVisibleQuestions(parsed, { defaultImage: false });
      expect(
        visible.find((question) => question.variable === 'image'),
      ).toBeTruthy();
    });

    it('hides subquestions if condition is not met', () => {
      const parsed = parseQuestions(MySQL as Question[]);
      const visible = parseVisibleQuestions(parsed, { defaultImage: true });
      expect(
        visible.find((question) => question.variable === 'image'),
      ).toBeFalsy();
    });

    it('parses subquestion types', () => {
      const parsed = parseQuestions(JFrog as Question[]);
      expect(parsed).toMatchSnapshot();
    });
  });
});
