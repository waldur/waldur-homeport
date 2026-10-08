import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BreadcrumbDropdown } from './BreadcrumbDropdown';

// The global @uirouter/react mock (test/mocks/router.js) hands out one router.
const { go } = useRouter().stateService;
const addFavoritePage = vi.fn();
const removeFavorite = vi.fn();

vi.mock('../favorite-pages/FavoritePageService', () => ({
  useFavoritePages: () => ({
    addFavoritePage,
    removeFavorite,
    isFavorite: () => false,
  }),
}));

vi.mock('@/navigation/sidebar/resources-filter/utils', () => ({
  useOrganizationAndProjectAutocompletesForResources: () => ({
    syncResourceFilters: vi.fn(),
  }),
}));

const projects = [
  { uuid: 'alpha', name: 'Alpha' },
  { uuid: 'beta', name: 'Beta' },
  { uuid: 'gamma', name: 'Gamma' },
];

const fetcher = vi.fn(() =>
  Promise.resolve({
    data: projects,
    response: new Response(null, {
      headers: {
        'content-type': 'application/json',
        'x-result-count': String(projects.length),
      },
    }),
  }),
);

const close = vi.fn();

const renderDropdown = () =>
  renderWithProviders(
    <BreadcrumbDropdown
      // The fake fetcher has no SDK types to infer queryField from.
      {...({ fetcher, queryField: 'query' } as any)}
      queryKey="projects"
      getItem={(row) => ({
        to: 'project.dashboard',
        params: { uuid: row.uuid },
        title: row.name,
        isCurrent: row.uuid === 'alpha',
      })}
      placeholder="Type in name of project..."
      close={close}
    />,
  );

// The search box is a combobox and the rows are the options of its listbox:
// focus stays in the box while the arrow keys move a highlight, which the box
// points at with aria-activedescendant.
describe('BreadcrumbDropdown', () => {
  beforeAll(() => {
    // downshift scrolls the highlighted row into view; jsdom has no layout.
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const highlighted = (input: HTMLElement) =>
    screen
      .queryAllByRole('option')
      .find(
        (option) => option.id === input.getAttribute('aria-activedescendant'),
      );

  it('is a labelled combobox over a listbox of the rows', async () => {
    renderDropdown();
    const input = screen.getByRole('combobox', {
      name: 'Type in name of project...',
    });
    expect(input).toHaveFocus();
    expect(await screen.findAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('listbox', { name: 'Search results' }).id).toBe(
      input.getAttribute('aria-controls'),
    );
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('highlights the first row, and the arrow keys move from there', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const input = screen.getByRole('combobox');
    await screen.findAllByRole('option');

    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));
    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Beta');
    expect(input).toHaveFocus();
  });

  it('opens the highlighted row on Enter', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const input = screen.getByRole('combobox');
    await screen.findAllByRole('option');
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));

    await user.keyboard('{ArrowDown}{Enter}');
    expect(go).toHaveBeenCalledWith('project.dashboard', { uuid: 'beta' });
    expect(close).toHaveBeenCalled();
  });

  it('moves the highlight to the first result when a search drops the highlighted row', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const input = screen.getByRole('combobox');
    await screen.findAllByRole('option');
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));
    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Beta');

    // The fake API answers every search with all three, so drop Beta from
    // the next answer.
    fetcher.mockImplementationOnce(() =>
      Promise.resolve({
        data: [projects[0], projects[2]],
        response: new Response(null, {
          headers: {
            'content-type': 'application/json',
            'x-result-count': '2',
          },
        }),
      }),
    );
    await user.type(input, 'a');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));
    await user.keyboard('{Enter}');
    expect(go).toHaveBeenCalledWith('project.dashboard', { uuid: 'alpha' });
  });

  it('toggles the highlighted row as a favourite with Ctrl+D, and says so', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const input = screen.getByRole('combobox');
    await screen.findAllByRole('option');
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));

    await user.keyboard('{Control>}d{/Control}');
    // Called directly, with no click event to stop.
    expect(addFavoritePage).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Alpha' }),
      undefined,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Added to favourites');
  });

  it('announces how many rows a search found', async () => {
    const user = userEvent.setup();
    renderDropdown();
    await screen.findAllByRole('option');

    await user.type(screen.getByRole('combobox'), 'a');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Results: 3'),
    );
  });
});
