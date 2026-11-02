import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { propVal } from './propertyFields';

const valueOf = (label: string) =>
  screen.getByRole('definition', { name: new RegExp(label) });

describe('propVal.boolean', () => {
  it('shows false in a summary list, which hides empty rows', () => {
    render(
      <PropertyList variant="summary">
        <PropertyItem label="Shared" value={propVal.boolean(false)} />
        <PropertyItem label="Billable" value={propVal.boolean(true)} />
        <PropertyItem label="Archived" value={propVal.boolean(null)} />
      </PropertyList>,
    );

    expect(valueOf('Shared')).toHaveTextContent('No');
    expect(valueOf('Billable')).toHaveTextContent('Yes');
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });

  it('shows a dash for a missing value in a divided list', () => {
    render(
      <PropertyList>
        <PropertyItem label="Archived" value={propVal.boolean(undefined)} />
      </PropertyList>,
    );

    expect(valueOf('Archived')).toHaveTextContent('—');
  });

  it('wears the chosen pair of badge variants', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Role"
          value={propVal.boolean(true, {
            wording: ['Replica', 'Primary'],
            display: 'badge',
            variants: ['info', 'primary'],
          })}
        />
        <PropertyItem
          label="Status"
          value={propVal.boolean(false, {
            wording: 'enabled',
            display: 'badge',
            variants: ['success', 'warning'],
          })}
        />
      </PropertyList>,
    );

    // The subtle fill names the variant without naming a ramp step.
    expect(screen.getByText('Replica')).toHaveClass('bg-info-subtle');
    expect(screen.getByText('Disabled')).toHaveClass('bg-warning-subtle');
  });

  it('reads in the chosen wording, painted when colored', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Login"
          value={propVal.boolean(false, { wording: 'enabled' })}
        />
        <PropertyItem
          label="User"
          value={propVal.boolean(true, { wording: 'active', colored: true })}
        />
      </PropertyList>,
    );

    expect(valueOf('Login')).toHaveTextContent('Disabled');
    expect(screen.getByText('Active')).toHaveClass('text-success');
  });

  it('draws a badge, or an icon named for screen readers', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Shared"
          value={propVal.boolean(true, { display: 'badge' })}
        />
        <PropertyItem
          label="Billable"
          value={propVal.boolean(false, { display: 'icon' })}
        />
      </PropertyList>,
    );

    expect(valueOf('Shared')).toHaveTextContent('Yes');
    expect(valueOf('Billable')).toHaveTextContent('No');
  });
});

describe('propVal.date', () => {
  it('renders a <time> element carrying the machine-readable date', () => {
    render(
      <PropertyList>
        <PropertyItem label="Created" value={propVal.date('2027-02-26')} />
      </PropertyList>,
    );

    const time = screen.getByText('26 Feb 2027');
    expect(time).toHaveProperty('tagName', 'TIME');
    expect(time).toHaveAttribute(
      'dateTime',
      expect.stringMatching(/^2027-02-26T/),
    );
  });

  it.each([null, '', 'not a date'])(
    'treats %j as missing and offers nothing to copy',
    (value) => {
      render(
        <PropertyList>
          <PropertyItem
            label="Completed"
            value={propVal.date(value)}
            placeholder="Never"
            hasCopy
          />
        </PropertyList>,
      );

      expect(valueOf('Completed')).toHaveTextContent('Never');
      expect(
        screen.queryByRole('button', { name: /copy/i }),
      ).not.toBeInTheDocument();
    },
  );

  it('copies the date as it reads', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Created"
          value={propVal.date('2027-02-26')}
          hasCopy
        />
      </PropertyList>,
    );

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('reads a month, and Unix seconds under epoch', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Period"
          value={propVal.date('2027-02-26', { precision: 'month' })}
        />
        <PropertyItem
          label="Sent"
          value={propVal.date(1803945600, { epoch: true })}
        />
      </PropertyList>,
    );

    expect(valueOf('Period')).toHaveTextContent('February 2027');
    expect(valueOf('Sent')).toHaveTextContent('2027');
  });
});

describe('propVal.text and propVal.code', () => {
  it('treats a blank string as missing', () => {
    render(
      <PropertyList>
        <PropertyItem label="Note" value={propVal.text('   ')} />
        <PropertyItem
          label="Backend ID"
          value={propVal.code('vm-42')}
          hasCopy
        />
      </PropertyList>,
    );

    expect(valueOf('Note')).toHaveTextContent('\u2014');
    expect(screen.getByText('vm-42')).toHaveProperty('tagName', 'CODE');
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});

describe('propVal.number', () => {
  it('shows 0, a unit, Unlimited, and a missing count as missingAs', () => {
    render(
      <PropertyList>
        <PropertyItem label="Retries" value={propVal.number(0)} />
        <PropertyItem
          label="Storage"
          value={propVal.number('1024', { unit: 'GB' })}
        />
        <PropertyItem
          label="Cores"
          value={propVal.number(-1, { unlimited: -1 })}
        />
        <PropertyItem
          label="Messages"
          value={propVal.number(null, { missingAs: 0 })}
        />
        <PropertyItem label="Uptime" value={propVal.number('not a number')} />
      </PropertyList>,
    );

    expect(valueOf('Retries')).toHaveTextContent('0');
    expect(valueOf('Storage')).toHaveTextContent('1,024 GB');
    expect(valueOf('Cores')).toHaveTextContent('Unlimited');
    expect(valueOf('Messages')).toHaveTextContent('0');
    expect(valueOf('Uptime')).toHaveTextContent('\u2014');
  });
});

describe('propVal.count', () => {
  it('formats a counter, defaulting null and undefined to 0', () => {
    render(
      <PropertyList>
        <PropertyItem label="Retries" value={propVal.count(5)} />
        <PropertyItem label="Zero" value={propVal.count(0)} />
        <PropertyItem label="Missing" value={propVal.count(null)} />
        <PropertyItem label="Undefined" value={propVal.count(undefined)} />
        <PropertyItem
          label="WithUnit"
          value={propVal.count(3, { unit: 'cores' })}
        />
      </PropertyList>,
    );

    expect(valueOf('Retries')).toHaveTextContent('5');
    expect(valueOf('Zero')).toHaveTextContent('0');
    expect(valueOf('Missing')).toHaveTextContent('0');
    expect(valueOf('Undefined')).toHaveTextContent('0');
    expect(valueOf('WithUnit')).toHaveTextContent('3 cores');
  });
});

describe('propVal.currency', () => {
  it('formats an API decimal string in the deployment currency', () => {
    render(
      <PropertyList>
        <PropertyItem label="Total" value={propVal.currency('1234.5')} />
        <PropertyItem label="Tax" value={propVal.currency(null)} />
      </PropertyList>,
    );

    expect(valueOf('Total')).toHaveTextContent(/1,234\.50/);
    expect(valueOf('Tax')).toHaveTextContent('\u2014');
  });
});

describe('propVal.state', () => {
  it('reads a known state from the map and an unknown one as it is', () => {
    const states = { OK: { label: 'Healthy', variant: 'success' as const } };
    render(
      <PropertyList>
        <PropertyItem label="Health" value={propVal.state('OK', { states })} />
        <PropertyItem
          label="Sync"
          value={propVal.state('Pending', { states })}
        />
      </PropertyList>,
    );

    expect(valueOf('Health')).toHaveTextContent('Healthy');
    expect(valueOf('Sync')).toHaveTextContent('Pending');
  });

  it('takes the badge size the row asks for', () => {
    const states = { new: { label: 'New', variant: 'info' as const } };
    render(
      <PropertyList>
        <PropertyItem
          label="Kind"
          value={propVal.state('new', { states, size: 'sm' })}
        />
      </PropertyList>,
    );

    expect(screen.getByText('New')).toHaveClass('text-xs');
  });
});

describe('propVal.list', () => {
  it('joins items, drops empty ones, and caps them at max', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Tags"
          value={propVal.list(['hpc', '', null, 'gpu'])}
        />
        <PropertyItem
          label="Hosts"
          value={propVal.list(['a', 'b', 'c'], { max: 2 })}
        />
        <PropertyItem label="Groups" value={propVal.list([])} />
      </PropertyList>,
    );

    expect(valueOf('Tags')).toHaveTextContent('hpc, gpu');
    expect(valueOf('Hosts')).toHaveTextContent('a, b +1 more');
    expect(valueOf('Groups')).toHaveTextContent('\u2014');
  });

  it('gives each stacked item its own copy icon under itemCopy', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="IPs"
          value={propVal.list(['10.0.0.1', '10.0.0.2'], {
            display: 'stack',
            itemCopy: true,
          })}
        />
      </PropertyList>,
    );

    expect(screen.getAllByRole('button', { name: /copy/i })).toHaveLength(2);
  });
});

describe('measures', () => {
  it('reads sizes, durations and percentages', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Disk"
          value={propVal.fileSize(2048, { unit: 'MB' })}
        />
        <PropertyItem
          label="Latency"
          value={propVal.duration(850, { unit: 'ms' })}
        />
        <PropertyItem
          label="Used"
          value={propVal.percent(0.256, { ratio: true })}
        />
        <PropertyItem label="Ratio" value={propVal.percent(null)} />
      </PropertyList>,
    );

    expect(valueOf('Disk')).toHaveTextContent('2 GB');
    expect(valueOf('Latency')).toHaveTextContent('850ms');
    expect(valueOf('Used')).toHaveTextContent('25.6%');
    expect(valueOf('Ratio')).toHaveTextContent('\u2014');
  });
});

describe('content', () => {
  it('reads an enum label, a user, plain text and JSON', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="Mode"
          value={propVal.enum('manual', {
            labels: { manual: 'Hold for manual advance' },
          })}
        />
        <PropertyItem
          label="Kind"
          value={propVal.enum('other', { labels: {} })}
        />
        <PropertyItem
          label="Source"
          value={propVal.enum('buy', {
            options: [{ value: 'buy', label: 'Buy price' }],
          })}
        />
        <PropertyItem
          label="Profile"
          value={propVal.boolean(false, {
            wording: ['Complete', 'Incomplete'],
          })}
        />
        <PropertyItem
          label="Created by"
          value={propVal.user({ full_name: 'Ada Lovelace', username: 'ada' })}
        />
        <PropertyItem
          label="Reviewer"
          value={propVal.user({ username: 'bob' })}
        />
        <PropertyItem
          label="Note"
          value={propVal.richText('line one\nline two')}
        />
        <PropertyItem
          label="Payload"
          value={propVal.json({ a: 1 }, { compact: true })}
        />
        <PropertyItem label="Empty" value={propVal.json({})} />
      </PropertyList>,
    );

    expect(valueOf('Mode')).toHaveTextContent('Hold for manual advance');
    expect(valueOf('Kind')).toHaveTextContent('other');
    expect(valueOf('Source')).toHaveTextContent('Buy price');
    expect(valueOf('Profile')).toHaveTextContent('Incomplete');
    expect(valueOf('Created by')).toHaveTextContent('Ada Lovelace (ada)');
    expect(valueOf('Reviewer')).toHaveTextContent('bob');
    expect(valueOf('Note')).toHaveTextContent('line one');
    expect(valueOf('Payload')).toHaveTextContent('{"a":1}');
    expect(valueOf('Empty')).toHaveTextContent('\u2014');
  });

  it('masks a secret and copies it without revealing it', () => {
    render(
      <PropertyList>
        <PropertyItem label="Token" value={propVal.secret('hunter2')} />
      </PropertyList>,
    );

    expect(screen.queryByText('hunter2')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});

describe('links', () => {
  it('keeps the row label beside a URL and a download', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="API URL"
          value={propVal.url('https://api.example.com')}
        />
        <PropertyItem
          label="Organization"
          value={propVal.link('OpenNode', {
            state: 'organization.details', // state-check: ignore
          })}
        />
        <PropertyItem
          label="Purchase order"
          value={propVal.file('https://example.com/po.pdf', {
            fileName: 'PDF file',
          })}
        />
        <PropertyItem
          label="Adoption document"
          value={propVal.file('https://example.com/media/abc/', {
            fileName: (url) => `${url.split('/').at(-2)}.pdf`,
            text: 'Download document',
          })}
        />
      </PropertyList>,
    );

    expect(valueOf('API URL')).toHaveTextContent('https://api.example.com');
    expect(
      within(valueOf('Purchase order')).getByRole('button', {
        name: 'Download',
      }),
    ).toBeInTheDocument();
    expect(valueOf('Adoption document')).toHaveTextContent('Download document');
  });
});

describe('propVal module', () => {
  it('returns null on empty values so PropertyList handles empty state', () => {
    expect(propVal.date(null)).toBeNull();
    expect(propVal.date(undefined)).toBeNull();
    expect(propVal.text('')).toBeNull();
    expect(propVal.text('   ')).toBeNull();
    expect(propVal.code(null)).toBeNull();
    expect(propVal.number(null)).toBeNull();
    expect(propVal.currency(undefined)).toBeNull();
    expect(propVal.boolean(null)).toBeNull();
    expect(propVal.boolean(undefined)).toBeNull();
    expect(propVal.fileSize(null)).toBeNull();
    expect(propVal.duration(null)).toBeNull();
    expect(propVal.percent(null)).toBeNull();
    expect(propVal.url(null)).toBeNull();
    expect(propVal.link(null, { state: 'test' })).toBeNull();
    expect(propVal.file(null)).toBeNull();
    expect(propVal.richText(null)).toBeNull();
    expect(propVal.enum(null, {})).toBeNull();
    expect(propVal.secret(null)).toBeNull();
    expect(propVal.json(null)).toBeNull();
    expect(propVal.list([])).toBeNull();
    expect(propVal.state(null, { states: {} })).toBeNull();
    expect(propVal.user(null)).toBeNull();
    expect(propVal.custom(null, (d) => d)).toBeNull();
  });

  it('formats custom, pair, metric, and quota', () => {
    const custom = propVal.custom('hello', (val) => <strong>{val}</strong>);
    expect(custom).not.toBeNull();
    expect(custom?.__isFormattedProperty).toBe(true);
    expect(custom?.text).toBe('hello');

    const pair = propVal.pair('2027-01-01', '2027-01-05');
    expect(pair).not.toBeNull();
    expect(pair?.text).toBe('2027-01-01 — 2027-01-05');

    const metric = propVal.metric(42, { unit: 'req/s' });
    expect(metric).not.toBeNull();
    expect(metric?.text).toBe('42 req/s');

    const quota = propVal.quota(10, 100, { unit: 'GB' });
    expect(quota).not.toBeNull();
    expect(quota?.text).toBe('10 / 100 GB');
  });

  it('renders propVal directly in PropertyList.Item with unified copy and display behavior', () => {
    render(
      <PropertyList>
        <PropertyList.Item
          label="Unified Date"
          value={propVal.date('2027-02-26')}
          hasCopy
        />
        <PropertyList.Item
          label="Unified Metric"
          value={propVal.metric(95, { unit: '%' })}
        />
        <PropertyList.Item
          label="Unified Custom"
          value={propVal.custom('custom-val', (v) => (
            <em>{v}</em>
          ))}
          hasCopy
        />
      </PropertyList>,
    );

    expect(valueOf('Unified Date')).toHaveTextContent('26 Feb 2027');
    expect(valueOf('Unified Metric')).toHaveTextContent('95 %');
    expect(valueOf('Unified Custom')).toHaveTextContent('custom-val');
    expect(screen.getAllByRole('button', { name: /copy/i })).toHaveLength(2);
  });
});
