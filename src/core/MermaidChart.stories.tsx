import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { buildTopologyMermaidCode } from '@/openstack/openstack-tenant/TenantTopology/buildMermaidCode';
import type { TopologyGraph } from '@/openstack/openstack-tenant/TenantTopology/types';
import { ThemeContext, ThemeName } from '@/theme/types';

import { MermaidChart } from './MermaidChart';

/**
 * Storybook has no ThemeProvider, so useTheme() would always say "light" and
 * MermaidChart would never redraw on a toolbar switch. Provide the toolbar's
 * theme, and set data-theme first: the preview's own decorator sets it in an
 * effect that runs after this story's children, and Mermaid reads it (and the
 * CSS variables that follow it) when it is configured. In the real app
 * loadTheme() sets it synchronously, before the re-render.
 */
const withStoryTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as ThemeName;
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>
      <div className="min-h-[240px] bg-[var(--surface-card-bg)] p-6">
        <Story />
      </div>
    </ThemeContext.Provider>
  );
};

const meta: Meta<typeof MermaidChart> = {
  title: 'Data Display/MermaidChart',
  component: MermaidChart,
  decorators: [withStoryTheme],
  parameters: {
    docs: {
      description: {
        component:
          'Renders Mermaid diagram source as SVG, themed from the design tokens: grays from the ramps (`gray` for light UI, `gray-dark` for dark), the diagram background from `--surface-card-bg`, brand colours from `--waldur-brand-*`. Mermaid draws from resolved colours, so it is configured on every render and redraws when the theme changes: flip the Theme toolbar to see it. `securityLevel` is `strict`, so `click` directives are stripped.',
      },
    },
  },
  argTypes: {
    code: { control: 'text' },
    className: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof MermaidChart>;

const FLOWCHART = `flowchart LR
  A[Tenant network] --> B[Router]
  B --> C[Instance]
  B --> D[(Volume)]
  D -.-> C`;

const SUBGRAPH = `flowchart LR
  subgraph T[Tenant]
    A[Network] --> B[Router]
  end
  B --> C[Instance]
  B ==> D[External network]`;

const SEQUENCE = `sequenceDiagram
  participant U as User
  participant W as Waldur
  participant B as Backend
  U->>W: Create resource
  W->>B: Provision
  Note over W,B: Polled until the order is done
  B-->>W: Ready
  W-->>U: Resource created`;

const STATE = `stateDiagram-v2
  [*] --> Draft
  Draft --> Pending: Submit
  Pending --> Active: Approve
  Pending --> Rejected: Reject
  Active --> [*]
  note right of Pending: Waits for a reviewer`;

// Mermaid is loaded lazily and draws several diagrams one after another, so
// the first render takes well over Testing Library's default second.
const RENDER = { timeout: 20_000 };

/** A diagram is drawn once Mermaid returns an SVG. */
const expectDiagram = async (canvasElement: HTMLElement) => {
  await expect(
    await within(canvasElement).findByRole(
      'graphics-document',
      undefined,
      RENDER,
    ),
  ).toBeInTheDocument();
};

/** Left to right flowchart with brand-coloured nodes. */
export const Flowchart: Story = {
  args: { code: FLOWCHART },
  play: ({ canvasElement }) => expectDiagram(canvasElement),
};

/** A cluster draws its title and a lighter fill behind its members. */
export const Subgraph: Story = {
  args: { code: SUBGRAPH },
  play: ({ canvasElement }) => expectDiagram(canvasElement),
};

/** Participants, messages and a note. */
export const Sequence: Story = {
  args: { code: SEQUENCE },
  play: ({ canvasElement }) => expectDiagram(canvasElement),
};

/** States, transitions and a note. */
export const State: Story = {
  args: { code: STATE },
  play: ({ canvasElement }) => expectDiagram(canvasElement),
};

const TOPOLOGY: TopologyGraph = {
  nodes: [
    {
      id: 'tenant:1',
      type: 'tenant',
      name: 'demo-tenant',
      uuid: null,
      attrs: {},
    },
    { id: 'net:1', type: 'network', name: 'private', uuid: null, attrs: {} },
    {
      id: 'subnet:1',
      type: 'subnet',
      name: '10.0.0.0/24',
      uuid: null,
      attrs: {},
    },
    { id: 'port:1', type: 'port', name: 'port-1', uuid: null, attrs: {} },
    { id: 'vm:1', type: 'instance', name: 'web-1', uuid: null, attrs: {} },
    { id: 'router:1', type: 'router', name: 'router', uuid: null, attrs: {} },
    {
      id: 'ext:1',
      type: 'external_network',
      name: 'public',
      uuid: null,
      attrs: {},
    },
    {
      id: 'fip:1',
      type: 'floating_ip',
      name: '203.0.113.10',
      uuid: null,
      attrs: {},
    },
  ],
  edges: [
    { source: 'tenant:1', target: 'net:1', kind: 'contains' },
    { source: 'net:1', target: 'subnet:1', kind: 'has_subnet' },
    { source: 'subnet:1', target: 'port:1', kind: 'has_port' },
    { source: 'port:1', target: 'vm:1', kind: 'attached_to' },
    { source: 'router:1', target: 'subnet:1', kind: 'has_interface' },
    { source: 'router:1', target: 'ext:1', kind: 'gateway' },
    { source: 'fip:1', target: 'vm:1', kind: 'floating_for' },
  ],
};

/**
 * The diagram the OpenStack tenant Topology tab draws, from a small graph. It
 * is the heaviest user of the component and colours its nodes with `classDef`
 * lines of its own, so it shows how those sit on each theme's background.
 */
export const TenantTopology: Story = {
  args: {
    code: buildTopologyMermaidCode(TOPOLOGY).code,
    className: 'overflow-auto',
  },
  play: ({ canvasElement }) => expectDiagram(canvasElement),
};

const GALLERY: [string, string][] = [
  ['Flowchart', FLOWCHART],
  ['Subgraph', SUBGRAPH],
  ['Sequence', SEQUENCE],
  ['State', STATE],
];

const Gallery = () => (
  <div className="grid gap-8 md:grid-cols-2">
    {GALLERY.map(([title, code]) => (
      <section key={title}>
        <h4 className="mb-2 text-sm font-semibold text-[var(--surface-text-primary)]">
          {title}
        </h4>
        <MermaidChart code={code} />
      </section>
    ))}
  </div>
);

/** All diagram types in the theme selected in the toolbar. */
export const AllDiagrams: Story = {
  render: () => <Gallery />,
  // findAllByRole resolves at the first diagram, so wait for all of them.
  play: async ({ canvasElement }) => {
    await waitFor(
      () =>
        expect(
          within(canvasElement).getAllByRole('graphics-document'),
        ).toHaveLength(GALLERY.length),
      RENDER,
    );
  },
};

/**
 * The same diagrams pinned to the dark theme, so a regression in the dark
 * colours (labels once drew near-black on dark green) shows in a visual diff.
 */
export const AllDiagramsDark: Story = {
  ...AllDiagrams,
  globals: { theme: 'dark' },
};

/** Source Mermaid cannot parse shows an error instead of a broken drawing. */
export const InvalidSyntax: Story = {
  args: { code: 'this is not a diagram' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Failed to render diagram',
        undefined,
        RENDER,
      ),
    ).toBeInTheDocument();
  },
};
