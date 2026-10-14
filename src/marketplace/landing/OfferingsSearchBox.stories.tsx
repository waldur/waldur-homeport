import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  memoryLocationPlugin,
  UIRouter,
  UIRouterReact,
  useCurrentStateAndParams,
} from '@uirouter/react';
import { ReactNode, useMemo } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { AsyncSearchBox } from '@/core/async/AsyncSearchBox';

import {
  getOfferingSearchItem,
  OfferingSearchItem,
  offeringSearchItemToString,
  OfferingSearchResult,
} from './OfferingsSearchBox';

/**
 * Stories for the marketplace landing page's offering search: an
 * `AsyncSearchBox` (a downshift combobox over `useAsyncCombobox`) whose rows
 * are `OfferingSearchResult`s. Each story renders the real components
 * against a fake fetcher and a memory-location router, so a row really
 * navigates, and the story shows where to.
 */

// --- Harness ---------------------------------------------------------------

const DETAILS_STATE = 'public-offering.marketplace-public-offering';
const ORDER_STATE = 'marketplace-offering-public';

/**
 * A fresh router per story render: `<UIRouter>` starts the router it is
 * given, and a router may start only once, while the docs page renders
 * every story at the same time.
 */
const StoryRouter = ({ children }: { children: ReactNode }) => {
  const router = useMemo(() => {
    const instance = new UIRouterReact();
    instance.plugin(memoryLocationPlugin);
    instance.stateRegistry.register({ name: 'home', url: '/' });
    instance.stateRegistry.register({
      name: 'public-offering',
      url: '/offerings/:uuid',
    });
    instance.stateRegistry.register({ name: DETAILS_STATE, url: '/' });
    instance.stateRegistry.register({
      name: ORDER_STATE,
      url: '/order/:offering_uuid',
    });
    instance.urlService.rules.initial({ state: 'home' });
    return instance;
  }, []);
  return <UIRouter router={router}>{children}</UIRouter>;
};

/** Where the last opened row took the router. */
const CurrentPage = () => {
  const { state, params } = useCurrentStateAndParams();
  return (
    <p className="mt-4 text-[13px] text-quaternary">
      Current page:{' '}
      <span data-testid="current-page">
        {state?.name === DETAILS_STATE
          ? `details of ${params.uuid}`
          : state?.name === ORDER_STATE
            ? `order of ${params.offering_uuid}`
            : '(none)'}
      </span>
    </p>
  );
};

const withHarness = (Story: () => React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <StoryRouter>
        <div className="p-12" style={{ minHeight: 520 }}>
          <Story />
          <CurrentPage />
        </div>
      </StoryRouter>
    </QueryClientProvider>
  );
};

// --- Data ------------------------------------------------------------------

interface OfferingRow {
  uuid: string;
  name: string;
  description: string;
}

const OFFERINGS: OfferingRow[] = [
  ['Kubernetes', 'Managed <b>Kubernetes</b> clusters on OpenStack.'],
  ['Research Data Vault', 'Cold storage for research data.'],
  ['Beta HPC cluster', 'CPU-only partitions, emulated.'],
  ['Alpha HPC cluster', 'CPU + GPU partitions, emulated.'],
  ['Beta Cloud', 'GPU-powered private cloud.'],
  ['Object storage', 'S3-compatible buckets.'],
  ['Virtual machines', 'OpenStack tenants and instances.'],
  ['Jupyter notebooks', ''],
  ['Measurement devices', 'Bookable lab equipment.'],
  ['Software licences', 'MATLAB, Ansys and more.'],
].map(([name, description], index) => ({
  uuid: `o-${String(index + 1).padStart(2, '0')}`,
  name,
  description,
}));

const respond = (
  rows: OfferingRow[],
  { total, next }: { total: number; next?: number },
) => ({
  data: rows,
  response: new Response(null, {
    headers: {
      'content-type': 'application/json',
      'x-result-count': String(total),
      ...(next
        ? {
            link: `<https://api.example/api/marketplace-public-offerings/?page=${next}>; rel="next"`,
          }
        : {}),
    },
  }),
});

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** A fetcher that searches by name and pages like the API does. */
const searchingFetcher =
  (offerings: OfferingRow[], pageSize = offerings.length) =>
  async ({ query }: { query: { keyword?: string; page?: number } }) => {
    await wait(200);
    const search = (query.keyword ?? '').toLowerCase();
    const matched = offerings.filter((offering) =>
      offering.name.toLowerCase().includes(search),
    );
    const page = query.page ?? 1;
    const rows = matched.slice((page - 1) * pageSize, page * pageSize);
    return respond(rows, {
      total: matched.length,
      next: page * pageSize < matched.length ? page + 1 : undefined,
    });
  };

// --- The search box --------------------------------------------------------

const PLACEHOLDER = 'Search offerings...';

/** OfferingsSearchBox.tsx with the fetcher swapped for a fake one. */
const OfferingSearch = ({
  fetcher,
}: {
  fetcher: (options: any) => Promise<any>;
}) => (
  <AsyncSearchBox<any, OfferingSearchItem>
    // The fake fetcher has no SDK types to infer queryField from.
    {...({ fetcher, queryField: 'keyword' } as any)}
    queryKey="story-offerings"
    params={{}}
    getItem={getOfferingSearchItem}
    itemToString={offeringSearchItemToString}
    renderItem={(props) => <OfferingSearchResult {...props} />}
    placeholder={PLACEHOLDER}
    emptyMessage="No offerings match your search."
    wrapperClassName="w-full max-w-[400px]"
  />
);

const meta: Meta<typeof OfferingSearch> = {
  title: 'Marketplace/OfferingsSearchBox',
  component: OfferingSearch,
  parameters: {
    docs: {
      description: {
        component:
          'The marketplace landing page\'s offering search: `AsyncSearchBox`, a downshift combobox whose results drop down in a portaled popover. The results show as the box takes focus (click or Tab) and as you type; focus stays in the box while ArrowUp/ArrowDown, Home and End move a highlight through them (options of a "Search results" listbox, pointed at with `aria-activedescendant`) and Enter opens the highlighted offering. Escape, Tab and a click elsewhere close them. Rows stay links, so a pointer can open one in a new tab; "Add resource" sits beside the option for the pointer, as an option takes no interactive children. A status region announces result counts and empty results. Downshift alone owns the open state; the Radix popover only positions the list.',
      },
    },
  },
  args: {
    fetcher: searchingFetcher(OFFERINGS),
  },
  decorators: [withHarness],
};
export default meta;

type Story = StoryObj<typeof OfferingSearch>;

const combobox = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('combobox', { name: PLACEHOLDER });

/** The option the search box points at with aria-activedescendant. */
const highlighted = (canvasElement: HTMLElement) => {
  const id = combobox(canvasElement).getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

// The results are portaled to the end of <body>, outside the canvas.
const waitForRows = () => screen.findAllByRole('option', {}, { timeout: 3000 });

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(combobox(canvasElement));
  const rows = await waitForRows();
  await waitFor(() =>
    expect(highlighted(canvasElement)).toHaveTextContent(OFFERINGS[0].name),
  );
  return rows;
};

// --- Stories ---------------------------------------------------------------

/** Collapsed until it takes focus; nothing is fetched before. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * A click on the box opens the results, and they stay open while focus is
 * in it: Radix used to take that focus for leaving the panel and close it
 * right after it opened.
 */
export const OpensOnFocus: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    const rows = await open(canvasElement);
    await expect(rows).toHaveLength(OFFERINGS.length);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(
      screen.getByRole('listbox', { name: 'Search results' }).id,
    ).toBe(input.getAttribute('aria-controls'));
    // Named by its name and description; the avatar's initials are hidden.
    await expect(rows[0]).toHaveAccessibleName(
      'Kubernetes Managed Kubernetes clusters on OpenStack.',
    );

    await wait(500);
    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveFocus();
  },
};

/** Tab into the box opens the results too. */
export const OpensOnTab: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(combobox(canvasElement)).toHaveFocus();
    await expect(await waitForRows()).toHaveLength(OFFERINGS.length);
  },
};

/**
 * ArrowDown/ArrowUp move the highlight, Home and End jump to the ends, and
 * the list scrolls to keep it in view. Focus never leaves the search box.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(highlighted(canvasElement)).toHaveTextContent(
      OFFERINGS[2].name,
    );
    await userEvent.keyboard('{End}');
    await expect(highlighted(canvasElement)).toHaveTextContent(
      OFFERINGS[OFFERINGS.length - 1].name,
    );
    await userEvent.keyboard('{Home}{ArrowUp}');
    // No wrapping: ArrowUp on the first row stays there.
    await expect(highlighted(canvasElement)).toHaveTextContent(
      OFFERINGS[0].name,
    );
    await expect(combobox(canvasElement)).toHaveFocus();
  },
};

/** Enter opens the highlighted offering's details and closes the results. */
export const EnterOpensTheHighlightedRow: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(
        within(canvasElement).getByTestId('current-page'),
      ).toHaveTextContent(`details of ${OFFERINGS[1].uuid}`),
    );
    await expect(combobox(canvasElement)).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

/** A click opens a row through its link. */
export const ClickOpensARow: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await userEvent.click(screen.getByText(OFFERINGS[3].name));
    await waitFor(() =>
      expect(
        within(canvasElement).getByTestId('current-page'),
      ).toHaveTextContent(`details of ${OFFERINGS[3].uuid}`),
    );
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * "Add resource" beside a row is for the pointer: hidden from assistive
 * technology and out of the tab order. It opens the order page.
 */
export const AddResource: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    const option = screen.getAllByRole('option')[0];
    const add = option.parentElement.querySelector(
      `a[href*="/order/${OFFERINGS[0].uuid}"]`,
    );
    await expect(add).toHaveAttribute('tabindex', '-1');
    await expect(add.closest('[aria-hidden="true"]')).not.toBeNull();
    await userEvent.click(add);
    await waitFor(() =>
      expect(
        within(canvasElement).getByTestId('current-page'),
      ).toHaveTextContent(`order of ${OFFERINGS[0].uuid}`),
    );
  },
};

/** Escape closes the results and keeps focus and the search text. */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    await open(canvasElement);
    await userEvent.type(input, 'beta');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('beta');
    // ArrowDown opens them again.
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  },
};

/** Tab and a click elsewhere close the results, opening nothing. */
export const LeavingCloses: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    await open(canvasElement);
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await open(canvasElement);
    await userEvent.click(within(canvasElement).getByText(/Current page/));
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(
      within(canvasElement).getByTestId('current-page'),
    ).toHaveTextContent('(none)');
  },
};

/**
 * The backend searches (downshift's own filter is off). The first match is
 * highlighted and the status region announces the count.
 */
export const Search: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    await open(canvasElement);
    await userEvent.type(input, 'hpc');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2), {
      timeout: 3000,
    });
    await waitFor(() =>
      expect(within(canvasElement).getByRole('status')).toHaveTextContent(
        'Results: 2',
      ),
    );
    await expect(highlighted(canvasElement)).toHaveTextContent(
      'Beta HPC cluster',
    );
  },
};

/** A search with no match says so, visibly and through the status region. */
export const NoResults: Story = {
  args: {
    fetcher: searchingFetcher([]),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(combobox(canvasElement));
    await expect(
      await screen.findByText(
        'No offerings match your search.',
        { selector: 'p' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'No offerings match your search.',
    );
  },
};

/** While the first page loads, the list holds a labelled progress indicator. */
export const Loading: Story = {
  args: {
    fetcher: () => new Promise(() => undefined),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(combobox(canvasElement));
    await expect(
      await screen.findByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
  },
};

/** A failed request shows an error and announces it. */
export const LoadError: Story = {
  args: {
    fetcher: () => Promise.reject(new Error('Network error')),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(combobox(canvasElement));
    await waitFor(() =>
      expect(within(canvasElement).getByRole('status')).toHaveTextContent(
        'Error',
      ),
    );
  },
};

/**
 * Results come a page at a time; the next loads as the end of the list
 * scrolls into view.
 */
export const LoadMore: Story = {
  args: {
    fetcher: searchingFetcher(OFFERINGS, 6),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(combobox(canvasElement));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(6), {
      timeout: 3000,
    });
    const listbox = screen.getByRole('listbox');
    listbox.scrollTop = listbox.scrollHeight;
    await waitFor(
      () =>
        expect(screen.getAllByRole('option')).toHaveLength(OFFERINGS.length),
      { timeout: 3000 },
    );
  },
};

/**
 * The keyboard pages too: ArrowDown on the last loaded row loads the next
 * page, announces it, and moves the highlight on to the first new row.
 */
export const KeyboardLoadsMore: Story = {
  args: {
    fetcher: searchingFetcher(OFFERINGS, 6),
  },
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await expect(screen.getAllByRole('option')).toHaveLength(6);
    await userEvent.keyboard('{End}');
    await expect(highlighted(canvasElement)).toHaveTextContent(
      OFFERINGS[5].name,
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(
      () =>
        expect(highlighted(canvasElement)).toHaveTextContent(OFFERINGS[6].name),
      { timeout: 3000 },
    );
    await expect(screen.getAllByRole('option')).toHaveLength(OFFERINGS.length);
    await expect(combobox(canvasElement)).toHaveFocus();
  },
};
