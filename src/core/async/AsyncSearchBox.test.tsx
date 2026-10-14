import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { AsyncSearchBox } from './AsyncSearchBox';

// The global @uirouter/react mock (test/mocks/router.js) hands out one router.
const { go } = useRouter().stateService;

// AsyncSearchBox infers its generic types from `fetcher` and `getItem`; a
// plain vi.fn() mock has no SDK-shaped signature to infer from.
const AnyAsyncSearchBox = AsyncSearchBox as any;

const offerings = [
  { uuid: 'alpha', name: 'Alpha' },
  { uuid: 'beta', name: 'Beta' },
  { uuid: 'gamma', name: 'Gamma' },
];

/**
 * The search box is a combobox; its results drop down as the options of a
 * listbox. Focus stays in the box while the arrow keys move a highlight,
 * which the box points at with aria-activedescendant.
 */
describe('AsyncSearchBox', () => {
  beforeAll(() => {
    // downshift scrolls the highlighted row into view; jsdom has no layout.
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSearchBox = (pageSize = offerings.length) => {
    const fetcher = vi.fn(({ query }) => {
      const matched = offerings.filter((row) =>
        row.name.toLowerCase().includes((query.keyword ?? '').toLowerCase()),
      );
      const page = query.page ?? 1;
      const hasNext = page * pageSize < matched.length;
      return Promise.resolve({
        data: matched.slice((page - 1) * pageSize, page * pageSize),
        response: new Response(null, {
          headers: {
            'content-type': 'application/json',
            'x-result-count': String(matched.length),
            ...(hasNext
              ? {
                  link: `<https://api.example/offerings/?page=${page + 1}>; rel="next"`,
                }
              : {}),
          },
        }),
      });
    });

    renderWithProviders(
      <AnyAsyncSearchBox
        fetcher={fetcher}
        queryKey="AsyncSearchBoxTest"
        queryField="keyword"
        getItem={(row) => ({
          to: 'public-offering.marketplace-public-offering',
          params: { uuid: row.uuid },
          name: row.name,
        })}
        itemToString={(item) => item.name}
        renderItem={({ item, itemProps }) => (
          <a {...itemProps} href={`#${item.params.uuid}`} tabIndex={-1}>
            {item.name}
          </a>
        )}
        placeholder="Search offerings..."
        emptyMessage="No offerings."
      />,
    );
    return {
      fetcher,
      input: screen.getByRole('combobox', { name: 'Search offerings...' }),
    };
  };

  const highlighted = (input: HTMLElement) =>
    screen
      .queryAllByRole('option')
      .find(
        (option) => option.id === input.getAttribute('aria-activedescendant'),
      );

  it('is a collapsed combobox until it takes focus, and fetches nothing', () => {
    const { input, fetcher } = renderSearchBox();

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('opens on focus, fetches and lists the results as options', async () => {
    const user = userEvent.setup();
    const { input, fetcher } = renderSearchBox();

    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(fetcher).toHaveBeenCalled();
    expect(await screen.findAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('listbox', { name: 'Search results' }).id).toBe(
      input.getAttribute('aria-controls'),
    );
  });

  // The input sits in the Popover's Anchor, outside its content, so Radix's
  // focus-outside handler took focus landing in it for leaving the panel and
  // closed it again right after the input opened it.
  it('keeps the results open while focus is in the search box', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await screen.findAllByRole('option');

    fireEvent.focusIn(input);
    await user.click(input);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('highlights the first row, and the arrow keys move from there', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await screen.findAllByRole('option');
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    // No wrapping: ArrowDown on the last row stays there.
    expect(highlighted(input)).toHaveTextContent('Gamma');
    await user.keyboard('{ArrowUp}');
    expect(highlighted(input)).toHaveTextContent('Beta');
    expect(input).toHaveFocus();
  });

  it('opens the highlighted row on Enter and closes', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await screen.findAllByRole('option');
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));
    await user.keyboard('{ArrowDown}{Enter}');

    expect(go).toHaveBeenCalledWith(
      'public-offering.marketplace-public-offering',
      { uuid: 'beta' },
    );
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape, keeping focus and the search', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await user.type(input, 'al');
    await screen.findAllByRole('option');
    await user.keyboard('{Escape}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('al');
    expect(go).not.toHaveBeenCalled();
  });

  it('closes on Tab without opening the highlighted row', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await screen.findAllByRole('option');
    await user.tab();

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(go).not.toHaveBeenCalled();
  });

  it('searches the backend and announces how many rows it found', async () => {
    const user = userEvent.setup();
    const { input, fetcher } = renderSearchBox();

    await user.click(input);
    await user.type(input, 'beta');

    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ keyword: 'beta' }),
        }),
      ),
    );
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(input).toHaveValue('beta');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Results: 1'),
    );
  });

  it('says when nothing matches', async () => {
    const user = userEvent.setup();
    const { input } = renderSearchBox();

    await user.click(input);
    await user.type(input, 'zzz');

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('No offerings.'),
    );
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  // downshift scrolls only the highlighted row into view, so the sentinel
  // after the last row never shows and the keyboard couldn't page.
  it('loads the next page on ArrowDown from the last row and moves on to it', async () => {
    const user = userEvent.setup();
    const { input, fetcher } = renderSearchBox(2);

    await user.click(input);
    expect(await screen.findAllByRole('option')).toHaveLength(2);
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Alpha'));

    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Beta');
    await user.keyboard('{ArrowDown}');

    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(3));
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ page: 2 }),
      }),
    );
    await waitFor(() => expect(highlighted(input)).toHaveTextContent('Gamma'));
    expect(input).toHaveFocus();

    // Nothing more to load: ArrowDown on the last row stays there.
    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Gamma');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
