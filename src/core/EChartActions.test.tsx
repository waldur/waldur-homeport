import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportPdf } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { saveFile } from '@/table/exporters/saveFile';

import { EChartActions } from './EChartActions';

// The menu itself is waldur-ui's; a plain button reaches the same handler.
vi.mock('./ChartExportDropdown', () => ({
  ChartExportDropdown: ({ onExportPdf }) => (
    <button onClick={onExportPdf}>PDF</button>
  ),
}));

vi.mock('@/table/exporters/saveFile', () => ({ saveFile: vi.fn() }));

describe('EChartActions PDF export', () => {
  const pdf = new Blob(['%PDF-'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the chart PNG and saves the PDF the server returns', async () => {
    vi.mocked(exportPdf).mockResolvedValue({ data: pdf } as any);
    const chart = { getDataURL: () => 'data:image/png;base64,AAAA' };
    render(<EChartActions chartInstance={chart} exportPdf exportTitle="CPU" />);

    await userEvent.click(screen.getByText('PDF'));

    await waitFor(() => expect(saveFile).toHaveBeenCalledWith(pdf, 'CPU.pdf'));
    expect(exportPdf).toHaveBeenCalledWith({
      body: { title: 'CPU', image: 'AAAA' },
    });
  });

  it('sends one request while a render is under way', async () => {
    let finish: (value: any) => void;
    vi.mocked(exportPdf).mockReturnValue(
      new Promise((resolve) => (finish = resolve)) as any,
    );
    const chart = { getDataURL: () => 'data:image/png;base64,AAAA' };
    render(<EChartActions chartInstance={chart} exportPdf exportTitle="CPU" />);

    await userEvent.click(screen.getByText('PDF'));
    await userEvent.click(screen.getByText('PDF'));
    finish({ data: pdf });

    await waitFor(() => expect(saveFile).toHaveBeenCalledTimes(1));
    expect(exportPdf).toHaveBeenCalledTimes(1);
  });

  it('reports a chart that cannot be captured and can try again', async () => {
    // A disposed echarts instance hands back no data URL.
    const chart = { getDataURL: () => undefined };
    render(<EChartActions chartInstance={chart} exportPdf exportTitle="CPU" />);
    const { showErrorResponse } = useNotify();

    await userEvent.click(screen.getByText('PDF'));
    await userEvent.click(screen.getByText('PDF'));

    await waitFor(() => expect(showErrorResponse).toHaveBeenCalledTimes(2));
    expect(exportPdf).not.toHaveBeenCalled();
  });
});
