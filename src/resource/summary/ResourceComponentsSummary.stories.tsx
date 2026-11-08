import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, within } from 'storybook/test';
import type { OfferingComponent, Resource } from 'waldur-js-client';

import { ResourceComponentsSummary } from './ResourceComponentsSummary';

/**
 * The components panel of an expanded resource row.
 *
 * Its width is the table's, not the viewport's, so the columns are sized by
 * container query rather than by breakpoint. The `Widths` story pins that
 * ladder down: six fixed columns used to leave ~55px each on a phone, which
 * cut every title and figure to an ellipsis.
 */
const meta: Meta<typeof ResourceComponentsSummary> = {
  title: 'Marketplace/Resources/Resource components summary',
  component: ResourceComponentsSummary,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ResourceComponentsSummary>;

const RESOURCE_UUID = '7c1b3f9a2d6e4b8c9f0a1b2c3d4e5f60';

const component = (
  type: string,
  name: string,
  billing_type: OfferingComponent['billing_type'],
  measured_unit: string,
): OfferingComponent =>
  ({ type, name, billing_type, measured_unit, factor: 1 }) as OfferingComponent;

// Seven components, with names long enough to show where a column is too
// narrow to hold a title.
const COMPONENTS: OfferingComponent[] = [
  component('cpu', 'Established connections', 'limit', ''),
  component('ram', 'API calls', 'usage', 'GB'),
  component('disk', 'Block storage', 'limit', 'GB'),
  component('gpu', 'GPU hours', 'usage', 'h'),
  component('net', 'Egress traffic', 'usage', 'TB'),
  component('ip', 'Floating IPs', 'limit', ''),
  component('snap', 'Snapshots', 'limit', ''),
];

const RESOURCE = {
  uuid: RESOURCE_UUID,
  offering_type: 'Marketplace.Basic',
  limits: { cpu: 1, disk: 1000, ip: 2, snap: 3 },
  limit_usage: { cpu: 0, disk: 0, ip: 0, snap: 0 },
  current_usages: { ram: 0, gpu: 0, net: 0 },
} as unknown as Resource;

/**
 * The panel's own query, seeded rather than mocked, so nothing hits the API.
 * The key matches ResourceComponentsSummary's customer-context query.
 */
const withSeededOffering = (Story: () => JSX.Element) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(
    ['resource-offering-components', RESOURCE_UUID, 'customer'],
    { components: COMPONENTS, plans: [] },
  );
  return (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  );
};

export const Default: Story = {
  decorators: [withSeededOffering],
  render: () => <ResourceComponentsSummary resource={RESOURCE} />,
};

/** The width each step of the ladder is checked at, and the columns it owes. */
const WIDTHS: Array<[width: number, columns: number]> = [
  [280, 1],
  [360, 2],
  [520, 3],
  [680, 4],
  [1040, 6],
];

export const Widths: Story = {
  decorators: [withSeededOffering],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {WIDTHS.map(([width]) => (
        <div key={width}>
          <div className="mb-1 text-xs text-tertiary">{width}px</div>
          <div
            data-testid={`width-${width}`}
            style={{ width }}
            className="border border-secondary"
          >
            <ResourceComponentsSummary resource={RESOURCE} />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [width, columns] of WIDTHS) {
      const grid = await canvas
        .findByTestId(`width-${width}`)
        .then((el) =>
          el.querySelector<HTMLElement>(
            '[data-slot="resource-components-grid"]',
          ),
        );
      expect(grid).not.toBeNull();
      // Each track resolves to a px value, so the count is the column count.
      const tracks = getComputedStyle(grid)
        .gridTemplateColumns.split(' ')
        .filter(Boolean);
      expect(
        tracks.length,
        `${width}px container should lay out ${columns} column(s)`,
      ).toBe(columns);
    }
  },
};
