import { describe, expect, it } from 'vitest';

import { answerFieldName, buildAnswers } from './answers';

const questions = [{ uuid: 'rating' }, { uuid: 'comment' }, { uuid: 'detail' }];
const all = new Set(questions.map((question) => question.uuid));

describe('buildAnswers', () => {
  it('sends the answers of visible questions', () => {
    const values = {
      [answerFieldName('rating')]: 8,
      [answerFieldName('comment')]: 'Fine',
    };
    expect(buildAnswers(questions, all, values, new Set())).toEqual([
      { question_uuid: 'rating', answer_data: 8 },
      { question_uuid: 'comment', answer_data: 'Fine' },
    ]);
  });

  it('leaves out empty answers that were never stored', () => {
    const values = {
      [answerFieldName('comment')]: null,
      [answerFieldName('detail')]: [],
    };
    expect(buildAnswers(questions, all, values, new Set())).toEqual([]);
  });

  it('deletes a stored answer that was cleared', () => {
    const values = { [answerFieldName('comment')]: null };
    expect(buildAnswers(questions, all, values, new Set(['comment']))).toEqual([
      { question_uuid: 'comment', answer_data: null },
    ]);
  });

  it('deletes a stored answer whose question is now hidden', () => {
    const values = { [answerFieldName('detail')]: 'Kept from a draft' };
    const visible = new Set(['rating', 'comment']);
    expect(
      buildAnswers(questions, visible, values, new Set(['detail'])),
    ).toEqual([{ question_uuid: 'detail', answer_data: null }]);
  });
});
