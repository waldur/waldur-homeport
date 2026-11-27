import { screen, waitFor } from '@testing-library/react';
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

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'cv.pdf is already in the list.',
      ),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('refuses a copy of an attached document as it is dropped', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <UploadDocumentationFiles
        input={{ value: [], onChange }}
        proposal={{
          uuid: 'p1',
          supporting_documentation: [
            {
              file_name: 'proposal_project_supporting_documentation/cv.pdf',
              // SHA-256 of "%PDF-1.4"
              file_hash:
                'e16fa5d9b51928755db85b917f0297babaf22c7a47e97d9212adab56e61ba04e',
            },
          ],
        }}
      />,
    );

    await userEvent.upload(
      screen.getByLabelText('Upload files'),
      pdf('renamed.pdf'),
    );

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        expect.stringContaining('already attached'),
      ),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the first drop when a second follows before the form re-renders', async () => {
    // The mock onChange never re-renders the field with the new value, as a
    // second drop landing before the form updates would see it.
    const onChange = renderUpload([]);
    const input = screen.getByLabelText('Upload files');

    await userEvent.upload(input, pdf('cv.pdf', '%PDF-1.4 cv'));
    await userEvent.upload(input, pdf('budget.pdf', '%PDF-1.4 budget'));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    const [files] = onChange.mock.lastCall;
    expect(files.map((file: File) => file.name)).toEqual([
      'cv.pdf',
      'budget.pdf',
    ]);
  });

  it('adds a new file to the pending ones', async () => {
    const cv = pdf('cv.pdf');
    const onChange = renderUpload([cv]);

    await userEvent.upload(
      screen.getByLabelText('Upload files'),
      pdf('budget.pdf', '%PDF-1.4 budget'),
    );

    // The files are hashed before they are listed.
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const [files] = onChange.mock.lastCall;
    expect(files.map((file: File) => file.name)).toEqual([
      'cv.pdf',
      'budget.pdf',
    ]);
  });
});
