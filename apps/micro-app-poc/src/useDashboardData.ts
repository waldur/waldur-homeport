import { useEffect, useState } from 'react';
import { fetchResultCount } from 'waldur-api-client';
import { translate } from 'waldur-i18n-runtime';
// waldur-js-client is deliberately absent from this app's own package.json
// — same reasoning as packages/api-client/src/requestHelpers.ts and
// packages/auth-core/src/client.ts: resolving it via workspace hoisting
// means this always sees root's exact pinned/linked SDK build, not a
// second, potentially-drifted copy declared here.
import {
  Customer,
  customersList,
  invoicesList,
  projectsList,
  projectsListUsersCount,
} from 'waldur-js-client';
import { StatusTone } from 'waldur-ui';

export interface ProjectRow {
  uuid: string;
  name: string;
  status: string;
  statusTone: StatusTone;
  members: number | string;
  monthlySpend: string;
}

interface DashboardData {
  orgName: string;
  projectsCount: number;
  usersCount: number;
  invoiceTotal: string;
  invoiceHint: string;
  rows: ProjectRow[];
}

interface OrgProjectData {
  invoiceTotal: string;
  invoiceHint: string;
  rows: ProjectRow[];
}

// src/core/formatCurrency.ts's real defaultCurrency() rounds to 2 decimal
// places by default (fractionSize only grows past that for sub-cent
// amounts, and this app doesn't have a "monthly spend under 5 cents" case
// to worry about) — passing invoice.total/billing_price_estimate.total
// straight through without that step is why these tiles showed a raw
// unrounded API decimal (e.g. "€1200.1200000000", a Django
// DecimalField's full string form) instead of a real amount. Not a full
// port of that function: it also resolves a tenant's CURRENCY_NAME and
// locale via ENV/getUserLocale(), neither of which this app threads
// through yet — just the rounding, with the same hardcoded € this file
// already used.
function formatEurAmount(value: string): string {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(value));
  return `€${formatted}`;
}

/** Real fetch/derive from status, not the mockup's status vocabulary — the
 * API has no plain status enum on Project (see ProjectLifecycleBadge.tsx
 * for the fuller real model); this is an honest two-state approximation
 * from actual fields, not an invented value. */
function deriveProjectStatus(project: { end_date?: string | null }): {
  status: string;
  tone: StatusTone;
} {
  const isPast = project.end_date
    ? new Date(project.end_date).getTime() < Date.now()
    : false;
  return isPast
    ? { status: translate('Closed'), tone: 'neutral' }
    : { status: translate('Active'), tone: 'success' };
}

// waldur-auth-core's error interceptor spreads the thrown Error into a
// plain object, losing its non-enumerable .message, so a network/HTTP
// failure here surfaces only a possible .response.
function describeFetchError(thrown: unknown): string {
  const withResponse = thrown as { response?: Response };
  return thrown instanceof Error
    ? thrown.message
    : withResponse.response
      ? withResponse.response.status === 401
        ? 'HTTP 401 — not authenticated (log into a real Waldur instance on this same origin first)'
        : `HTTP ${withResponse.response.status}`
      : `no response — is a backend running at ${document.querySelector<HTMLMetaElement>('meta[name="api-url"]')?.content}?`;
}

export function useDashboardData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<OrgProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // First page of organisations — populates OrgSwitcher's menu and picks
  // the first one as the initial selection.
  useEffect(() => {
    let cancelled = false;

    customersList({ query: { page_size: 10 } })
      .then((result) => {
        if (cancelled) return;
        const orgs = result.data ?? [];
        if (orgs.length === 0) {
          throw new Error('no customers found on this backend');
        }
        setCustomers(orgs);
        setSelectedUuid(orgs[0].uuid);
      })
      .catch((thrown) => {
        if (!cancelled) {
          setError(describeFetchError(thrown));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Whichever organisation is currently selected — its projects and most
  // recent invoice. Re-runs on every switch; clears the previous
  // selection's rows first so a switch never shows stale data under the
  // new organisation's name.
  useEffect(() => {
    if (!selectedUuid) return;
    let cancelled = false;
    setLoading(true);
    setProjectData(null);

    (async () => {
      try {
        const [invoicesResult, projectsResult] = await Promise.all([
          invoicesList({
            query: {
              customer_uuid: selectedUuid,
              page_size: 1,
              o: ['-created'],
            },
          }),
          projectsList({
            query: { customer: [selectedUuid], page_size: 10 },
          }),
        ]);

        const rows: ProjectRow[] = await Promise.all(
          (projectsResult.data ?? []).map(async (project) => {
            const { status, tone } = deriveProjectStatus(project);
            let members: number | string = '—';
            try {
              const countResult = await projectsListUsersCount({
                path: { uuid: project.uuid },
              });
              members = fetchResultCount(countResult as never);
            } catch {
              members = '—';
            }
            return {
              uuid: project.uuid,
              name: project.name,
              status,
              statusTone: tone,
              members,
              monthlySpend: project.billing_price_estimate?.total
                ? formatEurAmount(project.billing_price_estimate.total)
                : '—',
            };
          }),
        );

        const invoice = invoicesResult.data?.[0];

        if (!cancelled) {
          setProjectData({
            invoiceTotal: invoice ? formatEurAmount(invoice.total) : '—',
            invoiceHint: invoice
              ? translate('due {date}', { date: invoice.due_date })
              : translate('no invoices yet'),
            rows,
          });
        }
      } catch (thrown) {
        if (!cancelled) {
          setError(describeFetchError(thrown));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUuid]);

  const selectedCustomer =
    customers.find((customer) => customer.uuid === selectedUuid) ?? null;

  const data: DashboardData | null = selectedCustomer
    ? {
        orgName: selectedCustomer.name,
        projectsCount: selectedCustomer.projects_count,
        usersCount: selectedCustomer.users_count,
        // renderFieldOrDash() lives in @/table/utils — this app is
        // deliberately decoupled from src/table/* (see DataTable.tsx's
        // header comment), so that convention doesn't apply here.
        // eslint-disable-next-line waldur-custom/enforce-render-field-or-dash
        invoiceTotal: projectData?.invoiceTotal ?? '—',
        invoiceHint:
          projectData?.invoiceHint ??
          (loading ? translate('loading…') : translate('no invoices')),
        rows: projectData?.rows ?? [],
      }
    : null;

  return {
    customers,
    selectedUuid,
    selectCustomer: setSelectedUuid,
    data,
    error,
    loading,
  };
}
