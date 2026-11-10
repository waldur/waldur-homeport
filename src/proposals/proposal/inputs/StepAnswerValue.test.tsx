import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { downloadFile } from '@/form/upload/FileDownloader';
import { useNotify } from '@/store/notify';

import { StepAnswerValue } from './StepAnswerValue';

vi.mock('@/form/upload/FileDownloader', () => ({ downloadFile: vi.fn() }));

const answer = (answer_data: unknown, answer_display: string | null) =>
  ({
    question_uuid: 'q-1',
    question_description: 'Final report document',
    question_type: 'file',
    answer_data,
    answer_display,
  }) as any;

describe('StepAnswerValue', () => {
  it('offers an attached file for download by its name and size', async () => {
    render(
      <StepAnswerValue
        answer={answer(
          {
            name: 'final-report.pdf',
            size: 2048,
            mime_type: 'application/pdf',
            stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
          },
          'final-report.pdf (2.0 KB)',
        )}
      />,
    );
    expect(screen.queryByText(/stored_file_id/)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /final-report\.pdf/ }),
    );
    expect(downloadFile).toHaveBeenCalledWith(
      expect.stringContaining(
        'api/media/1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01/',
      ),
      'final-report.pdf',
    );
  });

  it('says so when the download fails', async () => {
    const error = new Error('Not found');
    vi.mocked(downloadFile).mockRejectedValueOnce(error);
    render(
      <StepAnswerValue
        answer={answer(
          {
            name: 'final-report.pdf',
            stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
          },
          'final-report.pdf',
        )}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Download final-report.pdf' }),
    );
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      'File download failed',
    );
  });

  it('shows a file that was never stored as its display text', () => {
    render(
      <StepAnswerValue
        answer={answer(
          { name: 'draft.pdf', stored_file_id: null },
          'draft.pdf',
        )}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('draft.pdf')).toBeInTheDocument();
  });

  it('offers each of several files', () => {
    render(
      <StepAnswerValue
        answer={answer(
          [
            {
              name: 'a.pdf',
              stored_file_id: '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01',
            },
            {
              name: 'b.png',
              stored_file_id: '2a2b6d3c-1e8f-4d4a-8b62-7e3a9f5c8d02',
            },
          ],
          'a.pdf, b.png',
        )}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Download a.pdf' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download b.png' }),
    ).toBeInTheDocument();
  });

  it.each([
    '../users/me',
    'file-1',
    '1f1e5c1a-0b7d-4c3e-9a51-6d2f8e4b7c01/../x',
  ])(
    'shows a file whose id is not a stored file id (%j) as its display text',
    (storedFileId) => {
      render(
        <StepAnswerValue
          answer={answer(
            { name: 'budget.pdf', stored_file_id: storedFileId },
            'budget.pdf',
          )}
        />,
      );
      expect(screen.getByText('budget.pdf')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it('shows any other answer as its display text', () => {
    render(<StepAnswerValue answer={answer('Resolved', 'Resolved')} />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });
});
