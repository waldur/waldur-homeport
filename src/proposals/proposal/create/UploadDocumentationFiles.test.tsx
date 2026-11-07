import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const pdf = (name: string, content = '%PDF-1.4') =>
  new File([content], name, { type: 'application/pdf', lastModified: 1 });

const renderUpload = (pending: File[] = []) => {
  const onChange = vi.fn();
  renderWithProviders(
    <UploadDocumentationFiles
      input={{ value: pending, onChange }}
      proposal={{ uuid: 'p1', supporting_documentation: [] }}
    />,
  );
  return onChange;
};

describe('UploadDocumentationFiles', () => {
  it('lists a file dropped twice once and says so', async () => {
    const cv = pdf('cv.pdf');
    const onChange = renderUpload([cv]);

    await userEvent.upload(
      screen.getByLabelText('Upload files'),
      pdf('cv.pdf'),
    );

    expect(onChange).toHaveBeenCalledWith([cv]);
    expect(useNotify().showInfo).toHaveBeenCalledWith(
      'cv.pdf is already in the list.',
    );
  });

  it('adds a new file to the pending ones', async () => {
    const cv = pdf('cv.pdf');
    const onChange = renderUpload([cv]);

    await userEvent.upload(
      screen.getByLabelText('Upload files'),
      pdf('budget.pdf', '%PDF-1.4 budget'),
    );

    const [files] = onChange.mock.lastCall;
    expect(files.map((file: File) => file.name)).toEqual([
      'cv.pdf',
      'budget.pdf',
    ]);
  });
});
