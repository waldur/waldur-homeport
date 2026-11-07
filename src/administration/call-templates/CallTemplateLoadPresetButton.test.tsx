import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CallTemplatePreset,
  callTemplatesLoadPreset,
  callTemplatesPresetsList,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { CallTemplateLoadPresetDialog } from './CallTemplateLoadPresetButton';
import { groupPresets, isEmptyCatalogue } from './presetCatalogue';

const euroHpcProgramme = {
  key: 'eurohpc-ju-access',
  name: 'EuroHPC JU access calls',
  organization: 'EuroHPC Joint Undertaking',
  organization_url: 'https://eurohpc-ju.europa.eu',
  reference_url: null,
  summary: 'The access calls of the EuroHPC Joint Undertaking.',
};

const nairrProgramme = {
  key: 'nsf-nairr-pilot',
  name: 'NAIRR Pilot',
  organization: 'U.S. National Science Foundation',
  organization_url: null,
  reference_url: 'https://nairrpilot.org/opportunities/allocations',
  summary: 'Research and classroom allocations.',
};

const euroHpc = {
  organization: 'EuroHPC Joint Undertaking',
  organization_url: 'https://eurohpc-ju.europa.eu',
  category: 'programme' as const,
  programme: euroHpcProgramme,
};

const nairr = {
  organization: 'U.S. National Science Foundation',
  organization_url: null,
  category: 'programme' as const,
  programme: nairrProgramme,
};

const presets: CallTemplatePreset[] = [
  {
    key: 'extreme_scale',
    name: 'Extreme Scale Access',
    description: 'Large allocations for exascale-ready projects.',
    steps: [
      {
        name: 'Admissibility check',
        kind: null,
        order: 0,
        is_enabled: true,
        phase: 'evaluation',
      } as any,
    ],
    preset: {
      ...euroHpc,
      process: 'Extreme Scale Access',
      reference_url: 'https://eurohpc-ju.europa.eu/extreme-scale',
      reference_title: 'Extreme Scale Access Mode',
      tags: ['HPC', 'cut-off'],
      summary: 'Largest allocations after each cut-off.',
    },
    name_taken: true,
  },
  {
    key: 'regular_access',
    name: 'Regular Access',
    description: 'Allocations for established research projects.',
    steps: [],
    preset: {
      ...euroHpc,
      process: 'Regular Access',
      tags: ['HPC'],
      summary: '',
    },
    name_taken: false,
  },
  {
    key: 'nairr_research',
    name: 'Research allocation',
    description: '',
    steps: [],
    preset: {
      ...nairr,
      process: 'Monthly merit review',
      tags: ['AI'],
      summary: 'Merit review, then resource matching.',
    },
    name_taken: false,
  },
  {
    key: 'nairr_classroom',
    name: 'Classroom allocation',
    description: '',
    steps: [],
    preset: {
      ...nairr,
      process: 'Classroom allocation',
      tags: ['education'],
      summary: 'Course allocations.',
    },
    name_taken: false,
  },
  {
    key: 'benchmark_access',
    name: 'Benchmark Access',
    description: '',
    steps: [],
    preset: null,
    name_taken: false,
  },
  {
    key: 'open_call',
    name: 'Open call',
    description: '',
    steps: [],
    preset: {
      organization: null,
      organization_url: null,
      programme: null,
      process: 'Rolling open call',
      category: 'generic',
      tags: ['continuous'],
      summary: 'Reviewed as proposals arrive.',
    },
    name_taken: false,
  },
];

const openProgramme = async (name: string) => {
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: new RegExp(`^${name}`) }));
};

// A disabled button has pointer-events: none in the browser; the check is
// off so the pointer can reach it as Radix's tooltip trigger.
const hoverLoad = async () => {
  const button = screen.getByRole('button', { name: 'Load' });
  expect(button).toBeDisabled();
  await userEvent.setup({ pointerEventsCheck: 0 }).hover(button);
};

const renderDialog = () =>
  renderWithProviders(
    <CallTemplateLoadPresetDialog resolve={{ refetch: vi.fn() }} />,
  );

describe('CallTemplateLoadPresetDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(callTemplatesPresetsList).mockResolvedValue({
      data: presets,
    } as any);
  });

  it('disables a preset whose name a template already holds', async () => {
    renderDialog();
    await openProgramme('EuroHPC JU access calls');
    const taken = await screen.findByRole('checkbox', {
      name: /Extreme Scale Access/,
    });
    expect(taken).toBeDisabled();
    expect(taken).not.toBeChecked();
    expect(screen.getByText('Name in use')).toBeInTheDocument();
    expect(screen.getByTestId('preset-name-taken')).toHaveTextContent(
      'A call template named Extreme Scale Access already exists',
    );
    expect(
      screen.getByRole('checkbox', { name: /Regular Access/ }),
    ).toBeEnabled();
    expect(
      screen.getByText('Allocations for established research projects.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled();
  });

  it('explains why Load is disabled', async () => {
    renderDialog();
    await screen.findByRole('checkbox', { name: /Rolling open call/ });
    await hoverLoad();
    expect(
      (await screen.findAllByText('Select at least one preset.')).length,
    ).toBeGreaterThan(0);
  });

  it('says when every preset name is in use', async () => {
    vi.mocked(callTemplatesPresetsList).mockResolvedValue({
      data: presets.map((preset) => ({ ...preset, name_taken: true })),
    } as any);
    renderDialog();
    await screen.findByRole('checkbox', { name: /Rolling open call/ });
    await hoverLoad();
    expect(
      (
        await screen.findAllByText(
          'A call template already holds the name of every preset.',
        )
      ).length,
    ).toBeGreaterThan(0);
  });

  it('shows the workflow of a preset on request', async () => {
    const user = userEvent.setup();
    renderDialog();
    await openProgramme('EuroHPC JU access calls');
    await user.click(
      await screen.findByRole('button', { name: 'Show workflow (1 steps)' }),
    );
    expect(await screen.findByText('Admissibility check')).toBeInTheDocument();
  });

  it('loads the selected presets and reports what it did', async () => {
    vi.mocked(callTemplatesLoadPreset).mockResolvedValue({
      data: {
        created: 2,
        created_names: ['Regular Access', 'Benchmark Access'],
      },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await openProgramme('EuroHPC JU access calls');
    await user.click(
      await screen.findByRole('checkbox', { name: /Regular Access/ }),
    );
    await user.click(
      screen.getByRole('checkbox', { name: /Benchmark Access/ }),
    );
    await user.click(
      screen.getByRole('checkbox', { name: /Publish after loading/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Load' }));

    await waitFor(() =>
      expect(callTemplatesLoadPreset).toHaveBeenCalledWith({
        body: {
          presets: ['regular_access', 'benchmark_access'],
          publish: true,
        },
      }),
    );
    await waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Loaded 2 call templates.',
      ),
    );
  });

  it('lists generic patterns flat, then programmes, then the rest', async () => {
    renderDialog();
    await screen.findByRole('checkbox', { name: /Rolling open call/ });
    const categories = screen.getAllByTestId('call-template-preset-category');
    expect(
      categories.map((category) => category.getAttribute('aria-label')),
    ).toEqual(['Generic patterns', 'Programmes', 'Other presets']);
    expect(
      within(categories[0]).getByRole('checkbox', {
        name: /Rolling open call/,
      }),
    ).toBeInTheDocument();
    expect(
      within(categories[2]).getByRole('checkbox', { name: /Benchmark Access/ }),
    ).toBeInTheDocument();
    // One group per programme, by name, folded until opened.
    expect(
      screen
        .getAllByTestId('call-template-preset-programme')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual(['EuroHPC JU access calls', 'NAIRR Pilot']);
    expect(
      screen.queryByRole('checkbox', { name: /Regular Access/ }),
    ).not.toBeInTheDocument();
  });

  it('names the organisation and summary of a programme', async () => {
    renderDialog();
    const group = within(
      (await screen.findAllByTestId('call-template-preset-programme'))[0],
    );
    const link = group.getByRole('link', {
      name: /EuroHPC Joint Undertaking/,
    });
    expect(link).toHaveAttribute('href', 'https://eurohpc-ju.europa.eu');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(
      group.getByText('The access calls of the EuroHPC Joint Undertaking.'),
    ).toBeInTheDocument();
    expect(group.getByText('2 processes')).toBeInTheDocument();
  });

  it('selects every preset of a programme at once', async () => {
    vi.mocked(callTemplatesLoadPreset).mockResolvedValue({
      data: { created: 2, created_names: [] },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('button', { name: 'Select all of NAIRR Pilot' }),
    );
    await openProgramme('NAIRR Pilot');
    expect(
      screen.getByRole('checkbox', { name: /Monthly merit review/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Classroom allocation/ }),
    ).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(callTemplatesLoadPreset).toHaveBeenCalledWith({
        body: {
          presets: ['nairr_research', 'nairr_classroom'],
          publish: false,
        },
      }),
    );
  });

  it('clears the selection of a programme', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('button', { name: 'Select all of NAIRR Pilot' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Clear the selection of NAIRR Pilot',
      }),
    );
    expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled();
  });

  it('selects only the presets of a programme whose name is free', async () => {
    vi.mocked(callTemplatesLoadPreset).mockResolvedValue({
      data: { created: 1, created_names: [] },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('button', {
        name: 'Select all of EuroHPC JU access calls',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(callTemplatesLoadPreset).toHaveBeenCalledWith({
        body: { presets: ['regular_access'], publish: false },
      }),
    );
  });

  it('shows the summary, tags and reference of a preset', async () => {
    renderDialog();
    await openProgramme('EuroHPC JU access calls');
    await screen.findByRole('checkbox', { name: /Extreme Scale Access/ });
    expect(
      screen.getByText('Largest allocations after each cut-off.'),
    ).toBeInTheDocument();
    expect(screen.getByText('cut-off')).toBeInTheDocument();
    const reference = screen.getByRole('link', { name: /^Reference/ });
    expect(reference).toHaveAttribute(
      'href',
      'https://eurohpc-ju.europa.eu/extreme-scale',
    );
    expect(reference).toHaveAttribute('target', '_blank');
    expect(reference.getAttribute('rel')).toContain('noopener');
  });

  it('filters presets by name, programme, organisation or tag', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByRole('checkbox', { name: /Rolling open call/ });
    const search = screen.getByRole('searchbox', { name: 'Search presets' });

    // A search opens the programmes it matches.
    await user.type(search, 'cut-off');
    expect(
      screen.getByRole('checkbox', { name: /Extreme Scale Access/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Regular Access/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Rolling open call/ }),
    ).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'nairr');
    expect(
      screen.getByRole('checkbox', { name: /Monthly merit review/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Classroom allocation/ }),
    ).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'national science foundation education');
    expect(
      screen.getByRole('checkbox', { name: /Classroom allocation/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Monthly merit review/ }),
    ).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'nothing like this');
    expect(
      screen.getByText('No presets match the search.'),
    ).toBeInTheDocument();
  });

  it('keeps a selection made before searching', async () => {
    vi.mocked(callTemplatesLoadPreset).mockResolvedValue({
      data: { created: 1, created_names: [] },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await openProgramme('EuroHPC JU access calls');
    await user.click(
      await screen.findByRole('checkbox', { name: /Regular Access/ }),
    );
    await user.type(
      screen.getByRole('searchbox', { name: 'Search presets' }),
      'continuous',
    );
    expect(screen.getByRole('button', { name: 'Load' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(callTemplatesLoadPreset).toHaveBeenCalledWith({
        body: { presets: ['regular_access'], publish: false },
      }),
    );
  });

  it('leaves unpublished unless asked', async () => {
    vi.mocked(callTemplatesLoadPreset).mockResolvedValue({
      data: { created: 1, created_names: [] },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('checkbox', { name: /Rolling open call/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(callTemplatesLoadPreset).toHaveBeenCalledWith({
        body: { presets: ['open_call'], publish: false },
      }),
    );
  });
});

describe('groupPresets', () => {
  it('splits generic patterns, programmes and the rest', () => {
    const catalogue = groupPresets(presets);
    expect(catalogue.generic.map((p) => p.key)).toEqual(['open_call']);
    expect(
      catalogue.programmes.map((group) => [
        group.programme.key,
        group.presets.map((p) => p.key),
      ]),
    ).toEqual([
      ['eurohpc-ju-access', ['extreme_scale', 'regular_access']],
      ['nsf-nairr-pilot', ['nairr_research', 'nairr_classroom']],
    ]);
    expect(catalogue.other.map((p) => p.key)).toEqual(['benchmark_access']);
  });

  it('matches every word of the query', () => {
    const keys = (query: string) => {
      const catalogue = groupPresets(presets, query);
      return [
        ...catalogue.generic,
        ...catalogue.programmes.flatMap((group) => group.presets),
        ...catalogue.other,
      ].map((p) => p.key);
    };
    expect(keys('eurohpc hpc')).toEqual(['extreme_scale', 'regular_access']);
    expect(keys('access calls')).toEqual(['extreme_scale', 'regular_access']);
    expect(keys('eurohpc continuous')).toEqual([]);
    expect(isEmptyCatalogue(groupPresets(presets, 'eurohpc continuous'))).toBe(
      true,
    );
  });
});
