import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ParsedAnswer } from './ParsedAnswer';

describe('ParsedAnswer', () => {
  describe('file upload answers', () => {
    it.each([null, ''])(
      'renders the name of a file stored without an id (%j) as text',
      (storedFileId) => {
        const question = {
          uuid: 'q1',
          question_type: 'file',
          description: 'Upload document',
          question_options: [],
        };
        const answer = {
          answer_data: { name: 'draft.pdf', stored_file_id: storedFileId },
        };

        render(
          <ParsedAnswer question={question as any} answer={answer as any} />,
        );

        expect(screen.getByText('draft.pdf')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      },
    );

    it('renders file name for file upload answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'file',
        description: 'Upload document',
        question_options: [],
      };
      const answer = {
        answer_data: {
          name: 'document.pdf',
          stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
        },
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText(/document\.pdf/)).toBeInTheDocument();
    });

    it('renders file name with size for file upload answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'file',
        description: 'Upload document',
        question_options: [],
      };
      const answer = {
        answer_data: {
          name: 'document.pdf',
          stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
          size: 1024 * 1024, // 1 MB
          mime_type: 'application/pdf',
        },
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText(/document\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/1 MB/)).toBeInTheDocument();
    });

    it('renders attachment count button for multiple files answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'multiple_files',
        description: 'Upload documents',
        question_options: [],
      };
      const answer = {
        answer_data: [
          {
            name: 'first.pdf',
            stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
          },
          {
            name: 'second.png',
            stored_file_id: '2a2b6d3c-1e8f-4d4a-8b62-7e3a9f5c8d02',
          },
        ],
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('2 attachments')).toBeInTheDocument();
    });

    it('renders single file link for multiple files answer with one file', () => {
      const question = {
        uuid: 'q1',
        question_type: 'multiple_files',
        description: 'Upload documents',
        question_options: [],
      };
      const answer = {
        answer_data: [
          {
            name: 'only.pdf',
            stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
          },
        ],
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText(/only\.pdf/)).toBeInTheDocument();
    });
  });

  describe('single_select answers', () => {
    it('renders option label for single_select answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'single_select',
        description: 'Select option',
        question_options: [
          { uuid: 'opt1', label: 'Option One' },
          { uuid: 'opt2', label: 'Option Two' },
        ],
      };
      const answer = {
        answer_data: ['opt1'],
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('Option One')).toBeInTheDocument();
    });
  });

  describe('multi_select answers', () => {
    it('renders multiple option labels joined by comma', () => {
      const question = {
        uuid: 'q1',
        question_type: 'multi_select',
        description: 'Select options',
        question_options: [
          { uuid: 'opt1', label: 'Option One' },
          { uuid: 'opt2', label: 'Option Two' },
          { uuid: 'opt3', label: 'Option Three' },
        ],
      };
      const answer = {
        answer_data: ['opt1', 'opt3'],
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('Option One, Option Three')).toBeInTheDocument();
    });
  });

  describe('boolean answers', () => {
    it('renders BooleanField for true value', () => {
      const question = {
        uuid: 'q1',
        question_type: 'boolean',
        description: 'Yes or no?',
        question_options: [],
      };
      const answer = {
        answer_data: true,
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      // BooleanField renders "Yes" or similar for true
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders BooleanField for false value', () => {
      const question = {
        uuid: 'q1',
        question_type: 'boolean',
        description: 'Yes or no?',
        question_options: [],
      };
      const answer = {
        answer_data: false,
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      // BooleanField renders "No" or similar for false
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('text answers', () => {
    it('renders text answer directly', () => {
      const question = {
        uuid: 'q1',
        question_type: 'text_input',
        description: 'Enter text',
        question_options: [],
      };
      const answer = {
        answer_data: 'This is my answer',
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('This is my answer')).toBeInTheDocument();
    });
  });

  describe('empty answers', () => {
    it('renders N/A for null answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'text_input',
        description: 'Enter text',
        question_options: [],
      };
      const answer = {
        answer_data: null,
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders N/A for undefined answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'text_input',
        description: 'Enter text',
        question_options: [],
      };
      const answer = null;

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders 0 for numeric zero answer', () => {
      const question = {
        uuid: 'q1',
        question_type: 'number',
        description: 'Enter number',
        question_options: [],
      };
      const answer = {
        answer_data: 0,
      };

      render(
        <ParsedAnswer question={question as any} answer={answer as any} />,
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
