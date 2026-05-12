import { describe, it, expect } from 'vitest';

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
      // @ts-ignore
      const visible = parseVisibleQuestions(parsed, { defaultImage: false });
      expect(
        visible.find((question) => question.variable === 'image'),
      ).toBeTruthy();
    });

    it('hides subquestions if condition is not met', () => {
      const parsed = parseQuestions(MySQL as Question[]);
      // @ts-ignore
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

  describe('parseVisibleQuestions with complex conditions', () => {
    const questions: Question[] = [
      {
        variable: 'q1',
        label: 'Q1',
        type: 'string',
        // @ts-ignore
        showIf: { varA: 'valA', varB: true },
      },
      {
        variable: 'q2',
        label: 'Q2',
        type: 'string',
        // @ts-ignore
        showIf: { varA: 'valB' },
      },
    ];

    it('shows question if all conditions are met', () => {
      const visible = parseVisibleQuestions(questions, {
        varA: 'valA',
        varB: true,
      });
      expect(visible.length).toBe(1);
      expect(visible[0].variable).toBe('q1');
    });

    it('hides question if some conditions are not met', () => {
      const visible = parseVisibleQuestions(questions, {
        varA: 'valA',
        varB: false,
      });
      expect(visible.length).toBe(0);
    });

    it('shows second question if its condition is met', () => {
      const visible = parseVisibleQuestions(questions, { varA: 'valB' });
      expect(visible.length).toBe(1);
      expect(visible[0].variable).toBe('q2');
    });
  });
});
