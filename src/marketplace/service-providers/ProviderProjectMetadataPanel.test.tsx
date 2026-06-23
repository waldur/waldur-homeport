import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectMetadataAnswer } from 'waldur-js-client';

import { ProviderProjectMetadataPanel } from './ProviderProjectMetadataPanel';

const answers = [
  {
    question_uuid: 'q1',
    question: 'Call ID',
    question_type: 'text_input',
    answer: 'EXT-2026-042',
  },
  {
    question_uuid: 'q2',
    question: 'Project type',
    question_type: 'single_select',
    answer: 'Academic',
  },
] as unknown as ProjectMetadataAnswer[];

describe('ProviderProjectMetadataPanel', () => {
  it('renders a row per answer with question and resolved answer', () => {
    const { container } = render(
      <ProviderProjectMetadataPanel answers={answers} />,
    );
    expect(container.textContent).toContain('Call ID');
    expect(container.textContent).toContain('EXT-2026-042');
    expect(container.textContent).toContain('Project type');
    expect(container.textContent).toContain('Academic');
  });

  it('joins list answers (multi-select) for display', () => {
    const multi = [
      {
        question_uuid: 'q3',
        question: 'Tags',
        question_type: 'multi_select',
        answer: ['Alpha', 'Beta'],
      },
    ] as unknown as ProjectMetadataAnswer[];
    const { container } = render(
      <ProviderProjectMetadataPanel answers={multi} />,
    );
    expect(container.textContent).toContain('Alpha, Beta');
  });

  it('renders a single file answer as its filename', () => {
    const fileAnswers = [
      {
        question_uuid: 'q4',
        question: 'Charter',
        question_type: 'file',
        answer: { name: 'charter.pdf', stored_file_id: 'f1', size: 2048 },
      },
    ] as unknown as ProjectMetadataAnswer[];
    const { container } = render(
      <ProviderProjectMetadataPanel answers={fileAnswers} />,
    );
    expect(container.textContent).toContain('charter.pdf');
    expect(container.textContent).not.toContain('[object Object]');
  });

  it('renders multiple file answers as an attachment count', () => {
    const fileAnswers = [
      {
        question_uuid: 'q5',
        question: 'Documents',
        question_type: 'multiple_files',
        answer: [
          { name: 'a.pdf', stored_file_id: 'f1' },
          { name: 'b.png', stored_file_id: 'f2' },
        ],
      },
    ] as unknown as ProjectMetadataAnswer[];
    const { container } = render(
      <ProviderProjectMetadataPanel answers={fileAnswers} />,
    );
    expect(container.textContent).toContain('2 attachments');
    expect(container.textContent).not.toContain('[object Object]');
  });

  it('shows an empty state when there are no answers', () => {
    const { container } = render(<ProviderProjectMetadataPanel answers={[]} />);
    expect(container.textContent).toContain('No project metadata');
    expect(container.textContent).not.toContain('Call ID');
  });
});
