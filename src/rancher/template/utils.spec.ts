import { groupQuestions } from './utils';
import { Question } from './types';

const questions: Question[] = require('./DataDog.json');

describe('Rancher application provision utils', () => {
  describe('groupQuestions', () => {
    it('groups questions', () => {
      expect(Object.keys(groupQuestions(questions))).toMatchSnapshot();
    });
  });
});
