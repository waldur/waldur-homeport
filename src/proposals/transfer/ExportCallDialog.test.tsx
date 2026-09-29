import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsExportCall } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { saveFile } from '@/table/exporters/saveFile';
import { renderWithProviders } from '@/test/harness';

import { ExportCallDialog } from './ExportCallDialog';

vi.mock('@/table/exporters/saveFile');
const exportResponse = (overrides = {}) => ({
  data: {
    call_uuid: 'call',
    call_name: 'Spring call',
    export_data: { schema_version: 1, call: { name: 'Spring call' } },
    exported_sections: [],
    export_timestamp: '2026-09-28T00:00:00Z',
    warnings: [],
    ...overrides,
  },
});

describe('ExportCallDialog', () => {
  const showRedirectMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showRedirectMessage,
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
  });

  const exportCall = async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExportCallDialog resolve={{ call: { uuid: 'call', name: 'Spring' } }} />,
    );
    await user.click(screen.getByLabelText('Rounds'));
    await user.click(screen.getByRole('button', { name: 'Export' }));
    await waitFor(() => expect(saveFile).toHaveBeenCalled());
  };

  it('sends unticked sections as false and downloads YAML', async () => {
    vi.mocked(proposalProtectedCallsExportCall).mockResolvedValue(
      exportResponse() as any,
    );
    await exportCall();

    const { body } = vi.mocked(proposalProtectedCallsExportCall).mock
      .calls[0][0];
    expect(body.include_rounds).toBe(false);
    expect(body.include_documents).toBe(true);
    const [blob, name] = vi.mocked(saveFile).mock.calls[0];
    expect(name).toBe('Spring call-export.yaml');
    expect(await blob.text()).toContain('schema_version: 1');
    expect(showRedirectMessage).not.toHaveBeenCalled();
  });

  it('warns about parts the backend left out', async () => {
    vi.mocked(proposalProtectedCallsExportCall).mockResolvedValue(
      exportResponse({
        warnings: ["Document 'a.pdf' could not be read and was left out."],
      }) as any,
    );
    await exportCall();

    expect(showRedirectMessage).toHaveBeenCalledWith(
      'Some parts were left out of the export',
      expect.stringContaining('a.pdf'),
    );
  });
});
