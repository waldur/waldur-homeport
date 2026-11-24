import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingTemplatesCreate,
  marketplaceOfferingTemplatesPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OfferingTemplateFormDialog } from './OfferingTemplateFormDialog';

const DOCUMENT = `offering:
  name: SLURM cluster
parameters:
  - key: account
    label: Account
    type: string
    paths: [offering.backend_id]
  - key: partition
    label: Partition
    type: string
    required: true
    paths: [offering.nowhere]
`;

const validationError = (body: Record<string, unknown>) => ({
  ...body,
  status: 400,
  response: { status: 400 },
});

const fillAndCreate = async (document = DOCUMENT) => {
  const user = userEvent.setup();
  renderWithProviders(<OfferingTemplateFormDialog resolve={{}} />);
  await user.type(screen.getByLabelText(/^Name/), 'SLURM');
  await user.click(screen.getByLabelText(/^Document/));
  await user.paste(document);
  await user.click(screen.getByRole('button', { name: 'Create' }));
  return user;
};

const typeDocument = async (document: string) => {
  const user = userEvent.setup();
  renderWithProviders(<OfferingTemplateFormDialog resolve={{}} />);
  await user.click(screen.getByLabelText(/^Document/));
  await user.paste(document);
  return screen.getByTestId('offering-template-document-parameters');
};

describe('OfferingTemplateFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a template with the document text as typed', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreate).mockResolvedValue({
      data: { uuid: 'template-uuid', name: 'SLURM' },
    } as any);
    await fillAndCreate();

    await waitFor(() =>
      expect(marketplaceOfferingTemplatesCreate).toHaveBeenCalledWith({
        body: {
          name: 'SLURM',
          description: '',
          offering_type: 'Marketplace.SiteAgent',
          is_published: false,
          document: DOCUMENT,
        },
      }),
    );
  });

  it('lists the parameters the document declares', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OfferingTemplateFormDialog resolve={{}} />);
    await user.click(screen.getByLabelText(/^Document/));
    await user.paste(DOCUMENT);
    const parameters = screen.getByTestId(
      'offering-template-document-parameters',
    );
    expect(within(parameters).getByText('partition')).toBeInTheDocument();
    expect(
      within(parameters).getByText('offering.nowhere'),
    ).toBeInTheDocument();
  });

  it('refuses text that is not a mapping before sending it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OfferingTemplateFormDialog resolve={{}} />);
    await user.type(screen.getByLabelText(/^Name/), 'SLURM');
    await user.click(screen.getByLabelText(/^Document/));
    await user.paste('just a line');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText(/The document must be a mapping of sections/),
    ).toBeInTheDocument();
    expect(marketplaceOfferingTemplatesCreate).not.toHaveBeenCalled();
  });

  it('shows the API errors on the fields that caused them', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreate).mockRejectedValue(
      validationError({
        name: ['An offering template with this name already exists.'],
        document: {
          'parameters.1.paths': [
            'offering.nowhere is not a path in the document.',
          ],
          agent_configuration: ['Unknown backend: lsf.'],
        },
      }),
    );
    await fillAndCreate();

    // The name error sits under the name field.
    expect(
      await screen.findByText(
        'An offering template with this name already exists.',
      ),
    ).toBeInTheDocument();

    // Each document error is listed under the document editor with its path,
    // and a parameter's error names that parameter.
    // The document field is described by its errors, each with its path,
    // and a parameter's error names that parameter.
    const editor = screen.getByLabelText(/^Document/);
    expect(editor).toHaveAccessibleDescription(
      expect.stringContaining(
        'parameters.1.paths (parameter partition): offering.nowhere is not a path in the document.',
      ),
    );
    expect(editor).toHaveAccessibleDescription(
      expect.stringContaining('agent_configuration: Unknown backend: lsf.'),
    );

    // The parameter's row in the summary carries it too.
    const row = screen.getByRole('row', { name: /partition/ });
    expect(within(row).getByTestId('parameter-problems')).toHaveTextContent(
      'paths: offering.nowhere is not a path in the document.',
    );
    expect(
      within(screen.getByRole('row', { name: /account/ })).queryByTestId(
        'parameter-problems',
      ),
    ).not.toBeInTheDocument();
  });

  it('reads nested document errors the same way', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreate).mockRejectedValue(
      validationError({
        document: {
          parameters: { 1: { paths: ['Not a path in the document.'] } },
        },
      }),
    );
    await fillAndCreate();

    expect(await screen.findByTestId('parameter-problems')).toHaveTextContent(
      'paths: Not a path in the document.',
    );
  });

  it('edits a template without resending an unchanged document', async () => {
    vi.mocked(marketplaceOfferingTemplatesPartialUpdate).mockResolvedValue({
      data: { uuid: 'template-uuid', name: 'SLURM HPC' },
    } as any);
    const user = userEvent.setup();
    renderWithProviders(
      <OfferingTemplateFormDialog
        resolve={{
          template: {
            uuid: 'template-uuid',
            name: 'SLURM',
            description: '',
            offering_type: 'Marketplace.SiteAgent',
            is_published: true,
            document: { offering: { name: 'SLURM cluster' } },
            parameters: [],
          } as any,
        }}
      />,
    );

    expect(screen.getByLabelText(/^Document/)).toHaveValue(
      JSON.stringify({ offering: { name: 'SLURM cluster' } }, null, 2),
    );
    const name = screen.getByDisplayValue('SLURM');
    await user.clear(name);
    await user.type(name, 'SLURM HPC');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceOfferingTemplatesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'template-uuid' },
        body: {
          name: 'SLURM HPC',
          description: '',
          offering_type: 'Marketplace.SiteAgent',
          is_published: true,
        },
      }),
    );
  });

  it('shows the API defaults for a parameter that leaves them out', async () => {
    const parameters = await typeDocument(`parameters:
  - key: account
    label: Account
    paths: [offering.backend_id]
`);
    const row = within(parameters).getByRole('row', { name: /account/ });
    // Key, label, type, required: the API reads the last two as string
    // and true.
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('string');
    expect(cells[3]).toHaveTextContent('Yes');
  });

  it('shows malformed parameters as they were typed without breaking', async () => {
    const parameters = await typeDocument(`parameters:
  - key: {nested: key}
    label: [Label, parts]
    type: {kind: string}
    required: maybe
    default: {value: 1}
    paths: offering.backend_id
  - key: cpus
    label: 4
    paths: [offering.access_url, 7, {path: x}, null]
  - just text
`);

    const nested = within(parameters).getByRole('row', {
      name: /"nested":"key"/,
    });
    expect(nested).toHaveTextContent('["Label","parts"]');
    expect(nested).toHaveTextContent('{"kind":"string"}');
    expect(nested).toHaveTextContent('maybe');
    expect(nested).toHaveTextContent('{"value":1}');
    // A path given as one string is that one path.
    expect(within(nested).getByText('offering.backend_id')).toBeInTheDocument();

    // Scalars are shown as text, and paths that are not text are left out.
    const cpus = within(parameters).getByRole('row', { name: /cpus/ });
    expect(cpus).toHaveTextContent('4');
    expect(within(cpus).getByText('offering.access_url')).toBeInTheDocument();
    expect(cpus).not.toHaveTextContent('{"path":"x"}');

    // An item that is not a mapping is a row of its own, marked invalid.
    expect(within(parameters).getAllByRole('row')).toHaveLength(4);
    expect(
      within(parameters).getByTestId('parameter-problems'),
    ).toHaveTextContent('A parameter must be a mapping of its fields.');
    // The editor keeps what was typed.
    expect(
      (screen.getByLabelText(/^Document/) as HTMLTextAreaElement).value,
    ).toContain('just text');
  });

  it('keeps each parameter at the position the API names it by', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreate).mockRejectedValue(
      validationError({
        document: { 'parameters.0': ['Expected a mapping.'] },
      }),
    );
    await fillAndCreate(`offering:
  name: SLURM cluster
parameters:
  - oops
  - key: a
    label: A
    paths: [offering.backend_id]
`);

    const parameters = screen.getByTestId(
      'offering-template-document-parameters',
    );
    await waitFor(() =>
      expect(
        within(parameters).getByTestId('parameter-problems'),
      ).toHaveTextContent('Expected a mapping.'),
    );
    const rows = within(parameters).getAllByRole('row');
    // The header, the refused item, then parameter a without problems.
    expect(rows).toHaveLength(3);
    expect(
      within(rows[1]).getByTestId('parameter-problems'),
    ).toBeInTheDocument();
    expect(
      within(rows[2]).queryByTestId('parameter-problems'),
    ).not.toBeInTheDocument();
  });

  it('hides the refused errors everywhere once the document is edited', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreate).mockRejectedValue(
      validationError({
        document: {
          'parameters.1.paths': [
            'offering.nowhere is not a path in the document.',
          ],
        },
      }),
    );
    const user = await fillAndCreate();
    const editor = screen.getByLabelText(/^Document/);
    await waitFor(() =>
      expect(editor).toHaveAccessibleDescription(
        expect.stringContaining('offering.nowhere is not a path'),
      ),
    );
    expect(screen.getByTestId('parameter-problems')).toBeInTheDocument();

    await user.click(editor);
    await user.keyboard('{End} ');

    expect(screen.queryByTestId('parameter-problems')).not.toBeInTheDocument();
    expect(editor).not.toHaveAccessibleDescription(
      expect.stringContaining('offering.nowhere is not a path'),
    );
    expect(
      screen.queryByText(/offering\.nowhere is not a path/),
    ).not.toBeInTheDocument();
  });
});
