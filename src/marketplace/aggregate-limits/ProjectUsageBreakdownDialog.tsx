import { useMemo, useState } from 'react';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';
import { ModalDialog } from '@/modal/ModalDialog';

interface ProjectEntry {
  project_uuid: string;
  project_name: string;
  usage: number;
}

interface DialogData {
  offering_name: string;
  type: string;
  measured_unit: string;
  limit: number | null;
  current_period_label: string;
  current_period_start: string | null;
  current_period_end: string | null;
  total_usage: number;
  projects: ProjectEntry[];
}

const numberFormatter = new Intl.NumberFormat(getUserLocale(), {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const ProjectUsageBreakdownDialog = ({
  resolve,
}: {
  resolve: {
    data: DialogData;
    offering: { uuid: string; name: string; type: string };
  };
}) => {
  const { data } = resolve;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.projects;
    return data.projects.filter((p) =>
      p.project_name.toLowerCase().includes(q),
    );
  }, [search, data.projects]);

  const limit = data.limit;
  const total = data.total_usage;

  // The `share of usage` bar is sized against the offering's cap when one
  // exists (so empty space corresponds to remaining headroom) and against
  // the current total otherwise.
  const denominator = limit ?? Math.max(total, 1);

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (data.current_period_start && data.current_period_end) {
      const start = new Date(data.current_period_start).toLocaleDateString(
        getUserLocale(),
        { month: 'short', day: 'numeric' },
      );
      const end = new Date(data.current_period_end).toLocaleDateString(
        getUserLocale(),
        { month: 'short', day: 'numeric' },
      );
      parts.push(`${data.current_period_label} (${start} – ${end})`);
    } else {
      parts.push(data.current_period_label);
    }
    parts.push(
      translate('{count} projects').replace(
        '{count}',
        String(data.projects.length),
      ),
    );
    parts.push(
      `${numberFormatter.format(total)}${
        limit != null ? ` / ${numberFormatter.format(limit)}` : ''
      } ${data.measured_unit}`,
    );
    return parts.join(' · ');
  }, [data, total, limit]);

  return (
    <ModalDialog
      title={translate('All projects using {offering}').replace(
        '{offering}',
        data.offering_name,
      )}
    >
      <div className="text-muted small mb-3">{subtitle}</div>
      <FilterBox
        type="search"
        placeholder={translate('Search projects...')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
        style={{ maxWidth: 320 }}
      />
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead>
            <tr>
              <th>{translate('Project')}</th>
              <th style={{ width: '40%' }}>{translate('Share of usage')}</th>
              <th className="text-end">{translate('Usage')}</th>
              <th className="text-end" style={{ width: 60 }}>
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted text-center py-3">
                  {translate('No matching projects.')}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const pct = (p.usage / denominator) * 100;
                return (
                  <tr key={p.project_uuid}>
                    <td>{p.project_name}</td>
                    <td>
                      <div
                        className="progress"
                        style={{ height: 8, backgroundColor: '#f1f5f9' }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            backgroundColor: '#16a34a',
                          }}
                        />
                      </div>
                    </td>
                    <td className="text-end">
                      {numberFormatter.format(p.usage)}
                    </td>
                    <td className="text-end text-muted">{Math.round(pct)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </ModalDialog>
  );
};
