import {
  CheckCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/**
 * One criterion of a rule checked against one user, as both the
 * auto-provisioning and the feature rule test-match endpoints report it.
 */
export interface FilterOutcome {
  name: string;
  configured: boolean;
  matched: boolean;
  user_value?: unknown;
  rule_value?: unknown;
  reason: string;
}

const FilterRow: FC<{ result: FilterOutcome }> = ({ result }) => {
  const valueOf = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '—';
    }
    // The claims filter reports a map; without this it renders as
    // "[object Object]".
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (!entries.length) return '—';
      return entries
        .map(([key, values]) => {
          const rendered = Array.isArray(values)
            ? renderFieldOrDash(values.join(', '))
            : String(values);
          return `${key}: ${rendered}`;
        })
        .join(' · ');
    }
    return String(value);
  };
  const iconClass = !result.configured
    ? 'text-quaternary'
    : result.matched
      ? 'text-success'
      : 'text-danger';
  return (
    <TableRow>
      <TableCell>
        {!result.configured ? (
          <WarningCircleIcon size={16} weight="bold" className={iconClass} />
        ) : result.matched ? (
          <CheckCircleIcon size={16} weight="bold" className={iconClass} />
        ) : (
          <XCircleIcon size={16} weight="bold" className={iconClass} />
        )}
      </TableCell>
      <TableCell>{result.name}</TableCell>
      <TableCell>{valueOf(result.rule_value)}</TableCell>
      <TableCell>{valueOf(result.user_value)}</TableCell>
      <TableCell className="text-quaternary">{result.reason}</TableCell>
    </TableRow>
  );
};

/** Each criterion of a rule, its value, the user's value and the verdict. */
export const FilterOutcomeTable: FC<{ results: FilterOutcome[] }> = ({
  results,
}) => (
  <Table density="compact" className="align-middle">
    <TableHeader>
      <TableRow>
        <TableHead className="w-6" />
        <TableHead>{translate('Filter')}</TableHead>
        <TableHead>{translate('Rule value')}</TableHead>
        <TableHead>{translate('User value')}</TableHead>
        <TableHead>{translate('Reason')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {results.map((result) => (
        <FilterRow key={result.name} result={result} />
      ))}
    </TableBody>
  </Table>
);
