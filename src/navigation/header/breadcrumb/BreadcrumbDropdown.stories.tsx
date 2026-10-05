import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  memoryLocationPlugin,
  UIRouter,
  UIRouterReact,
  useCurrentStateAndParams,
} from '@uirouter/react';
import { ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { IBreadcrumbItem } from '@/navigation/types';

import { BreadcrumbDropdown } from './BreadcrumbDropdown';
import { DropdownBreadcrumbItem } from './DropdownBreadcrumbItem';

/**
 * Stories for the breadcrumb switchers (project, resource, offering, order,
 * proposal): `BreadcrumbDropdown`, a downshift combobox whose rows are
 * `BreadcrumbSearchItem`s. Each story renders the real components against a
 * fake fetcher, a memory-location router (so a row really navigates, and the
 * story shows where to) and the favourites the app keeps in localStorage.
 */

// --- Harness ---------------------------------------------------------------

const FAVORITE_PAGES_KEY = 'waldur/favorite/pages';

const PROJECT_STATE = 'project.dashboard';

const CURRENT_UUID = 'p-03';

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
    // project.dashboard is a child of project, which must exist too.
    instance.stateRegistry.register({
      name: 'project',
      url: '/projects/:uuid',
    });
    instance.stateRegistry.register({ name: PROJECT_STATE, url: '/' });
    instance.urlService.rules.initial({ state: 'home' });
    return instance;
  }, []);
  return <UIRouter router={router}>{children}</UIRouter>;
};

/** Where the last opened row took the router. */
const CurrentPage = () => {
  const { state, params } = useCurrentStateAndParams();
  return (
    <p className="mt-4 text-[13px] text-[var(--surface-text-secondary)]">
      Current page:{' '}
      <span data-testid="current-page">
        {state?.name === PROJECT_STATE ? params.uuid : '(none)'}
      </span>
    </p>
  );
};

const withHarness = (Story: () => React.ReactElement) => {
  // The favourites hook reads the workspace; syncing the resource filters
  // after a row is opened reads the marketplace filters, dispatches to the
  // store and reads the offering categories, seeded empty so that nothing is
  // fetched.
  const store = configureStore()({
    workspace: {},
    tables: {},
    marketplace: { filters: { filtersStorage: [] } },
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(['ResourcesMenu', 'Categories'], []);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StoryRouter>
          <div className="p-12" style={{ minHeight: 520 }}>
            <Story />
            <CurrentPage />
          </div>
        </StoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// --- Data ------------------------------------------------------------------

interface ProjectRow {
  uuid: string;
  name: string;
  customer_name: string;
}

const NAMES = [
  'Atmospheric modelling',
  'Bioinformatics pipeline',
  'Climate archive',
  'Data lake migration',
  'Edge inference',
  'Genome assembly',
  'HPC benchmarks',
  'Image recognition',
  'Language models',
  'Materials simulation',
  'Neuroscience imaging',
  'Ocean drift',
];

const PROJECTS: ProjectRow[] = NAMES.map((name, index) => ({
  uuid: `p-${String(index + 1).padStart(2, '0')}`,
  name,
  customer_name: index % 2 ? 'University of Tartu' : 'Estonian Research Lab',
}));

const respond = (
  rows: ProjectRow[],
  { total, next }: { total: number; next?: number },
) => ({
  data: rows,
  response: new Response(null, {
    headers: {
      'content-type': 'application/json',
      'x-result-count': String(total),
      ...(next
        ? {
            link: `<https://api.example/api/projects/?page=${next}>; rel="next"`,
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
  (projects: ProjectRow[], pageSize = projects.length) =>
  async ({ query }: { query: { query?: string; page?: number } }) => {
    await wait(200);
    const search = (query.query ?? '').toLowerCase();
    const matched = projects.filter((project) =>
      project.name.toLowerCase().includes(search),
    );
    const page = query.page ?? 1;
    const rows = matched.slice((page - 1) * pageSize, page * pageSize);
    return respond(rows, {
      total: matched.length,
      next: page * pageSize < matched.length ? page + 1 : undefined,
    });
  };

// --- The switcher ----------------------------------------------------------

interface ProjectSwitcherProps {
  fetcher: (options: any) => Promise<any>;
  close: () => void;
  emptyMessage?: string;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

/**
 * src/project/ProjectBreadcrumbPopover.tsx with the fetcher swapped for a
 * fake one, in the panel its popover draws (DropdownBreadcrumbItem.tsx).
 */
const ProjectSwitcher = ({
  fetcher,
  close,
  emptyMessage = 'There are no projects.',
  filters,
}: ProjectSwitcherProps) => (
  <div className="w-[400px] rounded-lg border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] pb-2 shadow-[var(--dropdown-shadow)]">
    <BreadcrumbDropdown
      // The fake fetcher has no SDK types to infer queryField from.
      {...({ fetcher, queryField: 'query' } as any)}
      queryKey="story-projects"
      params={{}}
      getItem={(row) => ({
        to: PROJECT_STATE,
        params: { uuid: row.uuid },
        title: row.name,
        subtitle: row.customer_name,
        isCurrent: row.uuid === CURRENT_UUID,
      })}
      placeholder="Type in name of project..."
      emptyMessage={emptyMessage}
      filters={filters}
      close={close}
    />
  </div>
);

const meta: Meta<typeof ProjectSwitcher> = {
  title: 'Navigation/BreadcrumbDropdown',
  component: ProjectSwitcher,
  parameters: {
    docs: {
      description: {
        component:
          'The switcher a breadcrumb crumb opens: a downshift combobox. Focus stays in the search box while ArrowUp/ArrowDown, Home and End move a highlight through the rows (options of a "Search results" listbox, pointed at with `aria-activedescendant`) and Enter opens the highlighted row. Rows stay links, so a pointer can open one in a new tab. The current row has `aria-current="page"`; the highlighted one the hover background and a brand bar. The favourite star is for the pointer; Ctrl/⌘+D toggles it on the highlighted row. A status region announces result counts, empty results, errors and favourite changes. Reuse it, with `BreadcrumbSearchItem` rows, for any searchable list of links in a popover.',
      },
    },
  },
  args: {
    fetcher: searchingFetcher(PROJECTS),
    close: fn(),
  },
  decorators: [withHarness],
  beforeEach: () => {
    localStorage.removeItem(FAVORITE_PAGES_KEY);
  },
};
export default meta;

type Story = StoryObj<typeof ProjectSwitcher>;

const combobox = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('combobox', {
    name: 'Type in name of project...',
  });

/** The option the search box points at with aria-activedescendant. */
const highlighted = (canvasElement: HTMLElement) => {
  const id = combobox(canvasElement).getAttribute('aria-activedescendant');
  return within(canvasElement)
    .queryAllByRole('option')
    .find((option) => option.id === id);
};

const waitForRows = (canvasElement: HTMLElement) =>
  within(canvasElement).findAllByRole('option', {}, { timeout: 3000 });

// --- Stories ---------------------------------------------------------------

/**
 * The project switcher as it opens: focus in the search box, the first row
 * highlighted, the current project marked.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = combobox(canvasElement);
    await expect(input).toHaveFocus();
    await expect(await waitForRows(canvasElement)).toHaveLength(
      PROJECTS.length,
    );
    await expect(
      canvas.getByRole('listbox', { name: 'Search results' }).id,
    ).toBe(input.getAttribute('aria-controls'));
    await waitFor(() =>
      expect(highlighted(canvasElement)).toHaveTextContent(PROJECTS[0].name),
    );
    const current = canvas.getByRole('option', { current: 'page' });
    // Named by its title and subtitle; the avatar's initials are hidden.
    await expect(current).toHaveAccessibleName(
      `${PROJECTS[2].name} ${PROJECTS[2].customer_name}`,
    );
  },
};

/**
 * ArrowDown/ArrowUp move the highlight, Home and End jump to the ends, and
 * the list scrolls to keep it in view. Focus never leaves the search box.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const input = combobox(canvasElement);
    await waitForRows(canvasElement);
    await waitFor(() =>
      expect(highlighted(canvasElement)).toHaveTextContent(PROJECTS[0].name),
    );

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(highlighted(canvasElement)).toHaveTextContent(
      PROJECTS[2].name,
    );
    await userEvent.keyboard('{End}');
    await expect(highlighted(canvasElement)).toHaveTextContent(
      PROJECTS[PROJECTS.length - 1].name,
    );
    await userEvent.keyboard('{Home}{ArrowUp}');
    // No wrapping: ArrowUp on the first row stays there.
    await expect(highlighted(canvasElement)).toHaveTextContent(
      PROJECTS[0].name,
    );
    await expect(input).toHaveFocus();
  },
};

/**
 * Enter opens the highlighted row: the router goes to it (shown under the
 * panel) and the switcher closes (`close`, in the Actions panel).
 */
export const EnterOpensTheHighlightedRow: Story = {
  play: async ({ canvasElement, args }) => {
    await waitForRows(canvasElement);
    await waitFor(() =>
      expect(highlighted(canvasElement)).toHaveTextContent(PROJECTS[0].name),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(
        within(canvasElement).getByTestId('current-page'),
      ).toHaveTextContent(PROJECTS[1].uuid),
    );
    await expect(args.close).toHaveBeenCalled();
  },
};

/**
 * A click opens a row through its link, once (a row is `Command.Item
 * asChild` around a `Link`, so it can also be opened in a new tab).
 */
export const ClickOpensARow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitForRows(canvasElement);
    await userEvent.click(canvas.getByText(PROJECTS[4].name));
    await waitFor(() =>
      expect(canvas.getByTestId('current-page')).toHaveTextContent(
        PROJECTS[4].uuid,
      ),
    );
    await expect(args.close).toHaveBeenCalledTimes(1);
  },
};

/**
 * The backend searches (downshift's own filter is off). The first match is
 * highlighted and the status region announces the count; the clear button
 * empties the box and keeps focus in it.
 */
export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = combobox(canvasElement);
    await waitForRows(canvasElement);

    await userEvent.type(input, 'atmo');
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1), {
      timeout: 3000,
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Results: 1');
    await waitFor(() =>
      expect(highlighted(canvasElement)).toHaveTextContent(
        'Atmospheric modelling',
      ),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await waitFor(
      () => expect(canvas.getAllByRole('option')).toHaveLength(PROJECTS.length),
      { timeout: 3000 },
    );
  },
};

/** A search with no match says so, visibly and through the status region. */
export const NoResults: Story = {
  args: {
    fetcher: searchingFetcher([]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'There are no projects.',
        { selector: 'p' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'There are no projects.',
    );
    await expect(canvas.queryAllByRole('option')).toHaveLength(0);
  },
};

/** While the first page loads, the list holds a labelled progress indicator. */
export const Loading: Story = {
  args: {
    fetcher: () => new Promise(() => undefined),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
  },
};

/** A failed request shows an error and announces it. */
export const LoadError: Story = {
  args: {
    fetcher: () => Promise.reject(new Error('Network error')),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Error'),
    );
  },
};

/**
 * Results come a page at a time. An IntersectionObserver sentinel triggers
 * loading the next page when scrolled into view.
 */
export const LoadMore: Story = {
  args: {
    fetcher: searchingFetcher(PROJECTS, 7),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(7), {
      timeout: 3000,
    });
    const listbox = canvas.getByRole('listbox');
    listbox.scrollTop = listbox.scrollHeight;
    await waitFor(
      () => expect(canvas.getAllByRole('option')).toHaveLength(12),
      { timeout: 3000 },
    );
  },
};

/**
 * The star beside a row is for the pointer and shows on hover, on the
 * highlighted row and on favourites. Ctrl/⌘+D toggles the highlighted
 * row, as the search box's description says, and the change is announced.
 */
export const Favourites: Story = {
  beforeEach: () => {
    localStorage.setItem(
      FAVORITE_PAGES_KEY,
      JSON.stringify([
        {
          id: 'story-favourite',
          title: PROJECTS[1].name,
          subtitle: PROJECTS[1].customer_name,
          state: PROJECT_STATE,
          params: { uuid: PROJECTS[1].uuid },
        },
      ]),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(combobox(canvasElement)).toHaveAccessibleDescription(
      /to add the highlighted item to favourites or remove it/,
    );
    await waitForRows(canvasElement);
    await waitFor(() =>
      expect(highlighted(canvasElement)).toHaveTextContent(PROJECTS[0].name),
    );

    await userEvent.keyboard('{Control>}d{/Control}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Added to favourites',
    );
    await userEvent.keyboard('{ArrowDown}{Control>}d{/Control}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Removed from favourites',
    );
  },
};

/**
 * Switchers with filters (the offering switcher) put a filter toggle after
 * the search box; Tab reaches it, as the rows are out of the tab order.
 */
export const WithFilters: Story = {
  args: {
    filters: [
      {
        field: 'state',
        label: 'State',
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Paused', label: 'Paused' },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForRows(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Toggle filters' }),
    ).toHaveFocus();
  },
};

// --- In its crumb ----------------------------------------------------------

const crumb: IBreadcrumbItem = {
  key: 'project',
  text: PROJECTS[2].name,
  active: true,
  dropdown: (close) => (
    <BreadcrumbDropdown
      {...({ fetcher: searchingFetcher(PROJECTS), queryField: 'query' } as any)}
      queryKey="story-projects-crumb"
      params={{}}
      getItem={(row) => ({
        to: PROJECT_STATE,
        params: { uuid: row.uuid },
        title: row.name,
        subtitle: row.customer_name,
        isCurrent: row.uuid === CURRENT_UUID,
      })}
      placeholder="Type in name of project..."
      emptyMessage="There are no projects."
      close={close}
    />
  ),
};

/**
 * The switcher in its crumb (`DropdownBreadcrumbItem`). Enter on the crumb
 * opens it with focus in the search box; Escape or Tab closes it and puts
 * focus back on the crumb.
 */
export const InItsCrumb: Story = {
  render: () => (
    <ol className="breadcrumb">
      <DropdownBreadcrumbItem item={crumb} />
    </ol>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: new RegExp(PROJECTS[2].name),
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await screen.findAllByRole('option', {}, { timeout: 3000 });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
