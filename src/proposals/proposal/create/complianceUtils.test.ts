import { describe, expect, it } from 'vitest';

import { extractComplianceAnswers } from './complianceUtils';

describe('extractComplianceAnswers', () => {
  describe('filtering compliance fields', () => {
    it('extracts only compliance_ prefixed fields', () => {
      const formData = {
        name: 'Test Proposal',
        description: 'Description',
        compliance_q1: 'answer1',
        compliance_q2: 'answer2',
        other_field: 'other',
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        question_uuid: 'q1',
        answer_data: 'answer1',
      });
      expect(result).toContainEqual({
        question_uuid: 'q2',
        answer_data: 'answer2',
      });
    });

    it('returns empty array when no compliance fields exist', () => {
      const formData = {
        name: 'Test Proposal',
        description: 'Description',
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toEqual([]);
    });
  });

  describe('filtering empty values', () => {
    it('skips null values', () => {
      const formData = {
        compliance_q1: 'answer1',
        compliance_q2: null,
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toHaveLength(1);
      expect(result[0].question_uuid).toBe('q1');
    });

    it('skips undefined values', () => {
      const formData = {
        compliance_q1: 'answer1',
        compliance_q2: undefined,
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toHaveLength(1);
      expect(result[0].question_uuid).toBe('q1');
    });

    it('skips empty string values', () => {
      const formData = {
        compliance_q1: 'answer1',
        compliance_q2: '',
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toHaveLength(1);
      expect(result[0].question_uuid).toBe('q1');
    });

    it('keeps falsy values like 0 and false', () => {
      const formData = {
        compliance_q1: 0,
        compliance_q2: false,
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        question_uuid: 'q1',
        answer_data: 0,
      });
      expect(result).toContainEqual({
        question_uuid: 'q2',
        answer_data: false,
      });
    });
  });

  describe('single_select conversion', () => {
    it('converts single_select string answer to array', () => {
      const formData = {
        compliance_q1: 'option-uuid',
      };
      const checklistData = {
        questions: [{ uuid: 'q1', question_type: 'single_select' }],
      };

      const result = extractComplianceAnswers(formData, checklistData);

      expect(result[0].answer_data).toEqual(['option-uuid']);
    });

    it('does not convert non-single_select string answer', () => {
      const formData = {
        compliance_q1: 'text answer',
      };
      const checklistData = {
        questions: [{ uuid: 'q1', question_type: 'text_input' }],
      };

      const result = extractComplianceAnswers(formData, checklistData);

      expect(result[0].answer_data).toBe('text answer');
    });

    it('does not convert answer when question not found in checklistData', () => {
      const formData = {
        compliance_q1: 'option-uuid',
      };
      const checklistData = {
        questions: [{ uuid: 'q2', question_type: 'single_select' }],
      };

      const result = extractComplianceAnswers(formData, checklistData);

      expect(result[0].answer_data).toBe('option-uuid');
    });

    it('handles missing checklistData gracefully', () => {
      const formData = {
        compliance_q1: 'option-uuid',
      };

      const result = extractComplianceAnswers(formData, undefined);

      expect(result[0].answer_data).toBe('option-uuid');
    });

    it('handles checklistData without questions', () => {
      const formData = {
        compliance_q1: 'option-uuid',
      };
      const checklistData = { questions: undefined };

      const result = extractComplianceAnswers(
        formData,
        checklistData as { questions: undefined },
      );

      expect(result[0].answer_data).toBe('option-uuid');
    });
  });

  describe('different answer types', () => {
    it('handles boolean answers', () => {
      const formData = {
        compliance_q1: true,
        compliance_q2: false,
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toContainEqual({
        question_uuid: 'q1',
        answer_data: true,
      });
      expect(result).toContainEqual({
        question_uuid: 'q2',
        answer_data: false,
      });
    });

    it('handles number answers', () => {
      const formData = {
        compliance_q1: 42,
        compliance_q2: 0,
      };

      const result = extractComplianceAnswers(formData);

      expect(result).toContainEqual({
        question_uuid: 'q1',
        answer_data: 42,
      });
      expect(result).toContainEqual({
        question_uuid: 'q2',
        answer_data: 0,
      });
    });

    it('handles array answers (multi_select)', () => {
      const formData = {
        compliance_q1: ['opt1', 'opt2', 'opt3'],
      };

      const result = extractComplianceAnswers(formData);

      expect(result[0].answer_data).toEqual(['opt1', 'opt2', 'opt3']);
    });

    it('handles object answers (file upload)', () => {
      const fileAnswer = {
        name: 'document.pdf',
        content: 'base64encodedcontent',
      };
      const formData = {
        compliance_q1: fileAnswer,
      };

      const result = extractComplianceAnswers(formData);

      expect(result[0].answer_data).toEqual(fileAnswer);
    });
  });

  describe('complex scenarios', () => {
    it('handles mixed answer types correctly', () => {
      const formData = {
        name: 'Test',
        compliance_text: 'text answer',
        compliance_bool: true,
        compliance_select: 'opt1',
        compliance_multi: ['opt1', 'opt2'],
        compliance_empty: '',
        compliance_null: null,
        other: 'ignored',
      };
      const checklistData = {
        questions: [
          { uuid: 'text', question_type: 'text_input' },
          { uuid: 'bool', question_type: 'boolean' },
          { uuid: 'select', question_type: 'single_select' },
          { uuid: 'multi', question_type: 'multi_select' },
          { uuid: 'empty', question_type: 'text_input' },
          { uuid: 'null', question_type: 'text_input' },
        ],
      };

      const result = extractComplianceAnswers(formData, checklistData);

      expect(result).toHaveLength(4); // empty and null are filtered out
      expect(result).toContainEqual({
        question_uuid: 'text',
        answer_data: 'text answer',
      });
      expect(result).toContainEqual({
        question_uuid: 'bool',
        answer_data: true,
      });
      expect(result).toContainEqual({
        question_uuid: 'select',
        answer_data: ['opt1'], // converted to array
      });
      expect(result).toContainEqual({
        question_uuid: 'multi',
        answer_data: ['opt1', 'opt2'],
      });
    });
  });
});
