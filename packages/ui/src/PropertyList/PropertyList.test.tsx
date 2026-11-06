import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BaseButton } from '../Button';
import { CopyFeedbackProvider } from '../CopyButton';
import { Input } from '../Input';

import {
  CopyableValue,
  PropertyCard,
  PropertyItem,
  PropertyList,
} from './PropertyList';

describe('PropertyList', () => {
  it('renders semantic <dl>, <dt>, and <dd> with aria-labelledby association', () => {
    render(
      <PropertyList>
        <PropertyList.Item label="Region" value="eu-north-1" />
        <PropertyList.Item label="Cluster state" value="Active" />
      </PropertyList>,
    );

    expect(screen.getAllByRole('term')).toHaveLength(2);
    expect(screen.getAllByRole('definition')).toHaveLength(2);

    expect(
      screen.getByRole('definition', { name: 'Region' }),
    ).toHaveTextContent('eu-north-1');
    expect(
      screen.getByRole('definition', { name: 'Cluster state' }),
    ).toHaveTextContent('Active');
  });

  it('does not emit orphan <label> elements on read-only or action-only rows', () => {
    render(
      <PropertyList>
        <PropertyList.Item label="Name" value="Alpha" />
        <PropertyList.Item
          label="API URL"
          value="https://api.example.com"
          actions={<BaseButton label="Edit" />}
        />
      </PropertyList>,
    );

    expect(screen.getByText('Name').tagName).toBe('SPAN');
    expect(screen.getByText('API URL').tagName).toBe('SPAN');
  });

  it('links <label> and aria-describedby when an inline form control is mounted', () => {
    render(
      <PropertyList>
        <PropertyList.Item
          label="Retention"
          description="Days to keep backups"
          value={<Input />}
        />
      </PropertyList>,
    );

    const input = screen.getByLabelText('Retention');
    expect(input.tagName).toBe('INPUT');
    expect(screen.getByText('Retention').tagName).toBe('LABEL');
    expect(input).toHaveAccessibleDescription('Days to keep backups');
  });

  it('keeps one scope per row when multiple controls are mounted', () => {
    render(
      <PropertyList>
        <PropertyList.Item label="First" value={<Input />} />
        <PropertyList.Item label="Second" value={<Input />} />
      </PropertyList>,
    );
    const first = screen.getByLabelText('First');
    const second = screen.getByLabelText('Second');
    expect(first).not.toBe(second);
    expect(first.id).not.toBe(second.id);
  });

  it('omits empty values in summary mode while keeping 0', () => {
    render(
      <PropertyList variant="summary">
        <PropertyList.Item label="Empty string" value="" />
        <PropertyList.Item label="Null value" value={null} />
        <PropertyList.Item label="Undefined value" value={undefined} />
        <PropertyList.Item label="Zero count" value={0} />
      </PropertyList>,
    );

    expect(screen.queryByText(/Empty string/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Null value/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Undefined value/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('definition', { name: 'Zero count:' }),
    ).toHaveTextContent('0');
  });

  it('wraps a standalone PropertyItem in its own <dl> in summary mode by default', () => {
    render(
      <PropertyItem
        data-testid="standalone-item"
        label="Standalone key"
        value="Standalone value"
      />,
    );

    expect(screen.getByTestId('standalone-item').tagName).toBe('DL');
    expect(screen.getByRole('term')).toHaveTextContent('Standalone key:');
    expect(
      screen.getByRole('definition', { name: 'Standalone key:' }),
    ).toHaveTextContent('Standalone value');
  });

  it('shows a dash for an empty value in divided mode, keeping 0', () => {
    render(
      <PropertyList>
        <PropertyList.Item label="Router" value="" />
        <PropertyList.Item label="Nodes" value={0} />
      </PropertyList>,
    );

    expect(
      screen.getByRole('definition', { name: 'Router' }),
    ).toHaveTextContent('\u2014');
    expect(screen.getByLabelText('Not specified')).toBeInTheDocument();
    expect(screen.getByRole('definition', { name: 'Nodes' })).toHaveTextContent(
      '0',
    );
    // The dash is not worth copying, so no row offers it.
    expect(
      screen.queryByRole('button', { name: 'Copy to clipboard' }),
    ).not.toBeInTheDocument();
  });

  it.each(['divided', 'summary', 'compact'] as const)(
    'shows the placeholder for an empty value in %s mode, without a copy icon',
    (variant) => {
      render(
        <PropertyList variant={variant}>
          <PropertyList.Item
            label="Expires"
            value={null}
            placeholder="Never"
            hideIfEmpty={false}
            hasCopy
          />
        </PropertyList>,
      );

      expect(
        screen.getByRole('definition', { name: /Expires/ }),
      ).toHaveTextContent('Never');
      expect(
        screen.queryByRole('button', { name: 'Copy to clipboard' }),
      ).not.toBeInTheDocument();
    },
  );

  it('copies each CopyableValue on its own, showing children in place of the value', () => {
    render(
      <PropertyItem label="Secrets" variant="summary">
        <CopyableValue value="10.0.0.1" />
        <CopyableValue value="hunter2">••••</CopyableValue>
      </PropertyItem>,
    );

    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('••••')).toBeInTheDocument();
    expect(screen.queryByText('hunter2')).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Copy to clipboard' }),
    ).toHaveLength(2);
  });

  it('draws a dash for an empty compact row', () => {
    render(
      <PropertyList variant="compact">
        <PropertyList.Item label="Queue" value={null} />
      </PropertyList>,
    );

    expect(screen.getByRole('definition', { name: /Queue/ })).toHaveTextContent(
      '\u2014',
    );
  });

  it('draws a dash for an empty summary row kept by hideIfEmpty={false}', () => {
    render(
      <PropertyList variant="summary">
        <PropertyList.Item label="Router" value={null} hideIfEmpty={false} />
      </PropertyList>,
    );

    expect(
      screen.getByRole('definition', { name: /Router/ }),
    ).toHaveTextContent('\u2014');
  });

  it('shows children when there is no value', () => {
    render(
      <PropertyItem label="Plan">
        <span>Enterprise</span>
      </PropertyItem>,
    );

    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it.each([undefined, null, '', false])(
    'leaves a standalone summary row out when the value is %s',
    (value) => {
      const { container } = render(
        <PropertyItem label="Region" value={value} />,
      );

      expect(container).toBeEmptyDOMElement();
    },
  );

  it('sizes term width with termWidth preset in summary mode', () => {
    render(
      <PropertyItem
        data-testid="state-row"
        label="State"
        value="OK"
        termWidth="sm"
      />,
    );

    const row = screen.getByTestId('state-row');
    expect(row.style.getPropertyValue('--dt-width')).toBe('10rem');
    expect(row).toHaveClass('sm:grid-cols-[var(--dt-width)_minmax(0,1fr)]');
  });

  it('passes a list summary layout to every row, item termWidth winning', () => {
    render(
      <PropertyList variant="summary" termWidth="md" space={2.5}>
        <PropertyList.Item data-testid="state-row" label="State" value="OK" />
        <PropertyList.Item
          data-testid="region-row"
          label="Region"
          value="eu-north-1"
          termWidth="lg"
        />
      </PropertyList>,
    );

    expect(screen.getByTestId('state-row')).toHaveClass('mb-2.5');
    const regionRow = screen.getByTestId('region-row');
    expect(regionRow.style.getPropertyValue('--dt-width')).toBe('15rem');
  });

  it('stacks term above value in a stacked summary list, with no term track', () => {
    render(
      <PropertyList variant="summary" stacked termWidth="md">
        <PropertyList.Item
          data-testid="cpu-row"
          label="vCPUs"
          value="28"
          termWidth="lg"
        />
        <PropertyList.Item label="RAM" value={['64 GB', '40 GB']} />
      </PropertyList>,
    );

    // A term track would leave a narrow cell's value no width at all.
    const row = screen.getByTestId('cpu-row');
    expect(row).toHaveClass('flex', 'flex-col', 'mb-1');
    expect(row).not.toHaveClass('sm:grid');
    expect(row.className).not.toContain('grid-cols');
    // termWidth means nothing without a term track, so no --dt-width either.
    expect(row.style.getPropertyValue('--dt-width')).toBe('');
    for (const cell of [
      ...screen.getAllByRole('term'),
      ...screen.getAllByRole('definition'),
    ]) {
      expect(cell).toHaveClass('w-full');
      expect(cell).not.toHaveClass('sm:w-auto');
      expect(cell).not.toHaveClass('sm:col-start-2');
    }
  });

  it('merges a list labelClass into each row, behind a row override', () => {
    render(
      <PropertyList variant="summary" labelClass="min-w-[150px] font-semibold">
        <PropertyList.Item label="State" value="OK" />
        <PropertyList.Item
          label="Region"
          value="eu-north-1"
          labelClass="font-normal"
        />
      </PropertyList>,
    );

    const [state, region] = screen.getAllByRole('term');
    expect(state).toHaveClass('min-w-[150px]', 'font-semibold');
    // The row still carries the shared width, but wins on the conflict.
    expect(region).toHaveClass('min-w-[150px]', 'font-normal');
    expect(region).not.toHaveClass('font-semibold');
  });

  it('hides actions when hideActions is set on PropertyList', () => {
    render(
      <PropertyList hideActions>
        <PropertyList.Item
          label="Endpoint"
          value="https://example.com"
          actions={<BaseButton label="Edit endpoint" />}
        />
      </PropertyList>,
    );

    expect(
      screen.queryByRole('button', { name: 'Edit endpoint' }),
    ).not.toBeInTheDocument();
  });

  it('keeps disabled actions hoverable so their reason tooltip opens', async () => {
    render(
      <PropertyList>
        <PropertyList.Item
          label="Email"
          value="jane@example.com"
          disabled
          actions={
            <BaseButton
              label="Edit"
              disabled
              disabledReason="Managed by your identity provider."
            />
          }
        />
      </PropertyList>,
    );

    await userEvent.hover(screen.getByRole('button', { name: 'Edit' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Managed by your identity provider.',
    );
  });

  it('renders hasCopy as a named icon button, not for a dash', () => {
    render(
      <PropertyList variant="summary">
        <PropertyList.Item label="Backend ID" value="abc-123" hasCopy />
        <PropertyList.Item label="Router" value={'\u2014'} hasCopy />
      </PropertyList>,
    );

    const buttons = screen.getAllByRole('button', {
      name: 'Copy to clipboard',
    });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).not.toHaveTextContent('Copy');
  });

  it('shows the full clamped description in a tooltip', async () => {
    render(
      <PropertyList>
        <PropertyList.Item
          label="UID"
          description="POSIX UID supplied by the identity provider."
          value="100231"
        />
      </PropertyList>,
    );

    await userEvent.hover(
      screen.getByText('POSIX UID supplied by the identity provider.'),
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'POSIX UID supplied by the identity provider.',
    );
  });

  it('names an inline control by its label in summary mode', () => {
    render(
      <PropertyList variant="summary">
        <PropertyList.Item label="Retention" value={<Input />} />
      </PropertyList>,
    );

    expect(screen.getByLabelText('Retention:').tagName).toBe('INPUT');
  });

  it('lays a summary list out as a block, one row per line', () => {
    render(
      <PropertyList variant="summary" data-testid="summary-list">
        <PropertyList.Item label="Name" value="db-01" />
      </PropertyList>,
    );

    expect(screen.getByTestId('summary-list')).not.toHaveClass('grid');
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('keeps a standalone row divided when its actions are %s', (_, actions) => {
    render(
      <PropertyItem
        data-testid="standalone-item"
        label="Location"
        value=""
        actions={actions}
      />,
    );

    expect(screen.getByTestId('standalone-item')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  describe.each([
    ['compact', 'font-normal', 'text-end'],
    ['summary', 'font-medium', 'text-quaternary'],
    ['divided', 'font-medium', ''],
  ] as const)('%s rows', (variant, termClass, valueClass) => {
    it('keeps its term and value styling', () => {
      render(
        <PropertyList variant={variant}>
          <PropertyList.Item label="State" value="OK" />
        </PropertyList>,
      );

      expect(screen.getByRole('term')).toHaveClass(termClass);
      if (valueClass) {
        expect(screen.getByText('OK')).toHaveClass(valueClass);
      }
    });

    it('marks a required row with an asterisk', () => {
      render(
        <PropertyList variant={variant}>
          <PropertyList.Item label="State" value="OK" required />
        </PropertyList>,
      );

      expect(screen.getByRole('term')).toHaveTextContent('*');
    });

    it('marks a disabled row for styling', () => {
      render(
        <PropertyList variant={variant}>
          <PropertyList.Item
            data-testid="row"
            label="State"
            value="OK"
            disabled
          />
        </PropertyList>,
      );

      expect(screen.getByTestId('row')).toHaveAttribute('data-disabled');
    });
  });

  // Known limitation: only `divided` rows have an actions column and a
  // description line. A summary or compact row drops both.
  it.each(['summary', 'compact'] as const)(
    'drops actions and description on a %s row',
    (variant) => {
      render(
        <PropertyList variant={variant}>
          <PropertyList.Item
            label="Endpoint"
            value="https://api.example.com"
            description="Where the agent reports"
            actions={<BaseButton label="Edit" />}
          />
        </PropertyList>,
      );

      expect(
        screen.queryByRole('button', { name: 'Edit' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Where the agent reports'),
      ).not.toBeInTheDocument();
    },
  );

  it('gives the PropertyCard refresh button a name', () => {
    render(
      <PropertyCard title="Metadata" refetch={() => undefined}>
        <PropertyList />
      </PropertyCard>,
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('reports a copy, named by the row, to the CopyFeedbackProvider', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const onCopied = vi.fn();
    render(
      <CopyFeedbackProvider onCopied={onCopied}>
        <PropertyList>
          <PropertyList.Item label="Backend ID" value="abc-123" hasCopy />
        </PropertyList>
      </CopyFeedbackProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(writeText).toHaveBeenCalledWith('abc-123');
    expect(onCopied).toHaveBeenCalledWith({
      value: 'abc-123',
      name: 'Backend ID',
    });
  });

  it('pins the copy icon to the end of the value cell', () => {
    render(
      <PropertyList variant="summary">
        <PropertyList.Item label="Backend ID" value="abc-123" hasCopy />
      </PropertyList>,
    );

    const definition = screen.getByRole('definition', { name: 'Backend ID:' });
    // The value and the icon share one row that spreads them apart; that
    // row has no role to query by.
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('abc-123').parentElement).toHaveClass(
      'justify-between',
    );
    expect(definition).toContainElement(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    );
  });

  it('unpacks FormattedProperty node and uses its text for copying', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const formatted = {
      __isFormattedProperty: true as const,
      node: <span data-testid="custom-formatted">Formatted Node</span>,
      text: 'plain-copy-text',
    };
    render(
      <PropertyList>
        <PropertyList.Item label="Formatted Key" value={formatted} hasCopy />
      </PropertyList>,
    );

    expect(screen.getByTestId('custom-formatted')).toHaveTextContent(
      'Formatted Node',
    );
    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(writeText).toHaveBeenCalledWith('plain-copy-text');
  });

  it('truncates long copyable text when ellipsis or valueClass="ellipsis" is set', () => {
    render(
      <PropertyList variant="summary" valueClass="ellipsis">
        <PropertyList.Item
          label="SSH Key"
          value="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG5... very long key text"
          hasCopy
        />
      </PropertyList>,
    );

    const textSpan = screen.getByText(
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG5... very long key text',
    );
    expect(textSpan).toHaveClass('truncate');
    // eslint-disable-next-line testing-library/no-node-access
    expect(textSpan.parentElement).toHaveClass('justify-between');
    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    ).toBeInTheDocument();
  });

  describe('placeholder refactoring and semantic presets', () => {
    it('supports semantic presets (none, not-set, optional, na, dash)', () => {
      render(
        <PropertyList>
          <PropertyList.Item
            label="Preset None"
            value={null}
            placeholder="none"
          />
          <PropertyList.Item
            label="Preset Not Set"
            value={null}
            placeholder="not-set"
          />
          <PropertyList.Item
            label="Preset Optional"
            value={null}
            placeholder="optional"
          />
          <PropertyList.Item label="Preset NA" value={null} placeholder="na" />
          <PropertyList.Item
            label="Preset Dash"
            value={null}
            placeholder="dash"
          />
        </PropertyList>,
      );

      expect(
        screen.getByRole('definition', { name: 'Preset None' }),
      ).toHaveTextContent('None');
      expect(
        screen.getByRole('definition', { name: 'Preset Not Set' }),
      ).toHaveTextContent('Not set');
      expect(
        screen.getByRole('definition', { name: 'Preset Optional' }),
      ).toHaveTextContent('Optional');
      expect(
        screen.getByRole('definition', { name: 'Preset NA' }),
      ).toHaveTextContent('N/A');
      expect(screen.getByLabelText('Not applicable')).toBeInTheDocument();
      expect(
        screen.getByRole('definition', { name: 'Preset Dash' }),
      ).toHaveTextContent('—');
      expect(screen.getByLabelText('Not specified')).toBeInTheDocument();
    });

    it('inherits emptyPlaceholder from PropertyList context', () => {
      render(
        <PropertyList emptyPlaceholder="not-set">
          <PropertyList.Item label="Field A" value={null} />
          <PropertyList.Item label="Field B" value={null} />
          <PropertyList.Item
            label="Field C"
            value={null}
            placeholder="optional"
          />
        </PropertyList>,
      );

      expect(
        screen.getByRole('definition', { name: 'Field A' }),
      ).toHaveTextContent('Not set');
      expect(
        screen.getByRole('definition', { name: 'Field B' }),
      ).toHaveTextContent('Not set');
      expect(
        screen.getByRole('definition', { name: 'Field C' }),
      ).toHaveTextContent('Optional');
    });

    it('keeps empty rows visible in summary mode when custom placeholder is provided (smart hideIfEmpty defaulting)', () => {
      render(
        <PropertyList variant="summary">
          <PropertyList.Item label="Standard Empty" value={null} />
          <PropertyList.Item
            label="Item With Preset"
            value={null}
            placeholder="none"
          />
          <PropertyList.Item
            label="Item With String"
            value={null}
            placeholder="Auto-generated"
          />
          <PropertyList.Item
            label="Explicitly Hidden"
            value={null}
            placeholder="none"
            hideIfEmpty
          />
        </PropertyList>,
      );

      // Standard empty row without placeholder is hidden
      expect(screen.queryByText(/Standard Empty/)).not.toBeInTheDocument();
      // Explicitly hidden row is hidden even with placeholder
      expect(screen.queryByText(/Explicitly Hidden/)).not.toBeInTheDocument();

      // Custom placeholder rows are shown WITHOUT needing hideIfEmpty={false}
      expect(screen.getByText('Item With Preset:')).toBeInTheDocument();
      expect(
        screen.getByRole('definition', { name: 'Item With Preset:' }),
      ).toHaveTextContent('None');

      expect(screen.getByText('Item With String:')).toBeInTheDocument();
      expect(
        screen.getByRole('definition', { name: 'Item With String:' }),
      ).toHaveTextContent('Auto-generated');
    });

    it('inherits hideIfEmpty policy from PropertyList context', () => {
      // 1. In summary mode, hideIfEmpty={false} on PropertyList keeps all empty rows visible with dash
      const { unmount } = render(
        <PropertyList variant="summary" hideIfEmpty={false}>
          <PropertyList.Item label="Row A" value={null} />
          <PropertyList.Item label="Row B" value="" />
          <PropertyList.Item label="Row C" value={null} hideIfEmpty />
        </PropertyList>,
      );

      expect(screen.getByText('Row A:')).toBeInTheDocument();
      expect(
        screen.getByRole('definition', { name: 'Row A:' }),
      ).toHaveTextContent('—');
      expect(screen.getByText('Row B:')).toBeInTheDocument();
      expect(
        screen.getByRole('definition', { name: 'Row B:' }),
      ).toHaveTextContent('—');
      // Item-level hideIfEmpty overrides list-level hideIfEmpty={false}
      expect(screen.queryByText(/Row C/)).not.toBeInTheDocument();

      unmount();

      // 2. In divided mode, hideIfEmpty={true} on PropertyList hides all empty rows
      render(
        <PropertyList hideIfEmpty>
          <PropertyList.Item label="Divided Empty" value={null} />
          <PropertyList.Item label="Divided Filled" value="present" />
          <PropertyList.Item
            label="Divided Kept"
            value={null}
            hideIfEmpty={false}
          />
        </PropertyList>,
      );

      expect(screen.queryByText(/Divided Empty/)).not.toBeInTheDocument();
      expect(screen.getByText('Divided Filled')).toBeInTheDocument();
      // Item-level hideIfEmpty={false} overrides list-level hideIfEmpty={true}
      expect(screen.getByText('Divided Kept')).toBeInTheDocument();
    });

    it('treats empty arrays and NaN as empty values requiring placeholders', () => {
      render(
        <PropertyList>
          <PropertyList.Item
            label="Empty Array"
            value={[]}
            placeholder="none"
          />
          <PropertyList.Item
            label="NaN Value"
            value={NaN}
            placeholder="not-set"
          />
        </PropertyList>,
      );

      expect(
        screen.getByRole('definition', { name: 'Empty Array' }),
      ).toHaveTextContent('None');
      expect(
        screen.getByRole('definition', { name: 'NaN Value' }),
      ).toHaveTextContent('Not set');
    });

    it('applies data-slot="property-placeholder" and text-quaternary styling', () => {
      render(
        <PropertyList>
          <PropertyList.Item
            label="Styled Placeholder"
            value={null}
            placeholder="none"
          />
        </PropertyList>,
      );

      const placeholderEl = screen.getByText('None');
      expect(placeholderEl).toHaveAttribute(
        'data-slot',
        'property-placeholder',
      );
      expect(placeholderEl).toHaveClass('text-quaternary');
      expect(placeholderEl).toHaveClass('select-none');
    });

    it('suppresses copy button when placeholder is shown even if hasCopy is true', () => {
      render(
        <PropertyList>
          <PropertyList.Item
            label="Copy Empty"
            value={null}
            placeholder="none"
            hasCopy
          />
          <PropertyList.Item label="Copy Real" value="Valid Value" hasCopy />
        </PropertyList>,
      );

      expect(screen.getByText('None')).toBeInTheDocument();
      const copyButtons = screen.getAllByRole('button', {
        name: 'Copy to clipboard',
      });
      expect(copyButtons).toHaveLength(1);
    });
  });

  describe('RFC additions: termWidth, items, copyable, and array values', () => {
    it('sets --dt-width CSS variable for termWidth presets and custom values', () => {
      const { rerender } = render(
        <PropertyList termWidth="md" data-testid="pl-test">
          <PropertyList.Item label="CPU" value="4 cores" />
          <PropertyList.Item label="RAM" value="16 GB" />
        </PropertyList>,
      );

      const listEl = screen.getByTestId('pl-test');
      expect(listEl.style.getPropertyValue('--dt-width')).toBe('12.5rem');

      rerender(
        <PropertyList termWidth="sm" data-testid="pl-test">
          <PropertyList.Item label="CPU" value="4 cores" />
        </PropertyList>,
      );
      expect(listEl.style.getPropertyValue('--dt-width')).toBe('10rem');

      rerender(
        <PropertyList termWidth="220px" data-testid="pl-test">
          <PropertyList.Item label="CPU" value="4 cores" />
        </PropertyList>,
      );
      expect(listEl.style.getPropertyValue('--dt-width')).toBe('220px');
    });

    it('applies grid column template matching var(--dt-width) in summary mode', () => {
      render(
        <PropertyList variant="summary" termWidth="md">
          <PropertyList.Item
            label="OS"
            value="Ubuntu 24.04"
            data-testid="row-os"
          />
        </PropertyList>,
      );

      const row = screen.getByTestId('row-os');
      expect(row).toHaveClass('sm:grid');
      expect(row).toHaveClass('sm:grid-cols-[var(--dt-width)_minmax(0,1fr)]');
    });

    it('supports data-driven rendering via items prop array', () => {
      render(
        <PropertyList
          items={[
            { label: 'Cluster', value: 'production-01' },
            { label: 'Nodes', value: 8 },
            { label: 'Region', value: 'Europe-North' },
          ]}
        />,
      );

      expect(screen.getByText('Cluster')).toBeInTheDocument();
      expect(screen.getByText('production-01')).toBeInTheDocument();
      expect(screen.getByText('Nodes')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Europe-North')).toBeInTheDocument();
    });

    it('renders copyable={true} and copyable="explicit text"', () => {
      render(
        <PropertyList>
          <PropertyList.Item label="IP" value="192.168.1.1" copyable />
          <PropertyList.Item
            label="Masked Token"
            value={<span>••••••••</span>}
            copyable="secret-token-abc"
          />
          <PropertyList.Item
            label="Static"
            value="Not Copyable"
            copyable={false}
          />
        </PropertyList>,
      );

      const copyButtons = screen.getAllByRole('button', {
        name: 'Copy to clipboard',
      });
      // Exactly 2 buttons: for IP and Masked Token
      expect(copyButtons).toHaveLength(2);
    });

    it('renders an array of values as multiple sibling <dd> elements', () => {
      render(
        <PropertyList variant="divided">
          <PropertyList.Item
            label="DNS Servers"
            value={['1.1.1.1', '8.8.8.8', '9.9.9.9']}
            copyable
          />
        </PropertyList>,
      );

      const dds = screen.getAllByRole('definition');
      expect(dds).toHaveLength(3);
      expect(dds[0]).toHaveTextContent('1.1.1.1');
      expect(dds[1]).toHaveTextContent('8.8.8.8');
      expect(dds[2]).toHaveTextContent('9.9.9.9');

      // Subsequent dd elements carry sm:col-start-2 to align in the value column
      expect(dds[1]).toHaveClass('sm:col-start-2');
      expect(dds[2]).toHaveClass('sm:col-start-2');

      // Each dd has its own copy button
      const copyButtons = screen.getAllByRole('button', {
        name: 'Copy to clipboard',
      });
      expect(copyButtons).toHaveLength(3);
    });

    it('normalizes empty array value={[]} to a single <dd> with placeholder', () => {
      render(
        <PropertyList>
          <PropertyList.Item label="Tags" value={[]} placeholder="none" />
        </PropertyList>,
      );

      const dds = screen.getAllByRole('definition');
      expect(dds).toHaveLength(1);
      expect(dds[0]).toHaveTextContent('None');
    });
  });

  describe('PropertyList.Section', () => {
    it('renders a section header with title and description inside a list', () => {
      render(
        <PropertyList>
          <PropertyList.Section
            title="General information"
            description="Basic account attributes"
          >
            <PropertyList.Item label="Name" value="Alice" />
          </PropertyList.Section>
        </PropertyList>,
      );

      expect(screen.getByText('General information')).toBeInTheDocument();
      expect(screen.getByText('Basic account attributes')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
