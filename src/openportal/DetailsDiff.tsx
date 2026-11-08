import { FC, ReactNode } from 'react';

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

const sortedStringify = (value: unknown): string => {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(',')}]`;
  if (typeof value === 'object') {
    const sorted = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${sortedStringify((value as any)[k])}`);
    return `{${sorted.join(',')}}`;
  }
  return JSON.stringify(value);
};

const renderValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined) {
    return renderFieldOrDash(value);
  }
  if (typeof value === 'boolean') {
    return value ? translate('True') : translate('False');
  }
  if (typeof value !== 'object') {
    return String(value);
  }
  return (
    <pre className="mb-0 text-xs whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

interface DetailsDiffProps {
  before: Record<string, unknown> | null | undefined;
  after: Record<string, unknown> | null | undefined;
  beforeLabel?: string;
  afterLabel?: string;
  afterNote?: ReactNode;
}

export const DetailsDiff: FC<DetailsDiffProps> = ({
  before,
  after,
  beforeLabel,
  afterLabel,
  afterNote,
}) => {
  const beforeObj = before ?? {};
  const afterObj = after ?? {};
  const hasBoth =
    Object.keys(beforeObj).length > 0 && Object.keys(afterObj).length > 0;
  const keys = Array.from(
    new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]),
  ).sort();

  if (keys.length === 0) {
    return <span className="text-quaternary">{renderFieldOrDash(null)}</span>;
  }

  return (
    <Table
      density="compact"
      className="mb-0 text-xs align-middle"
      data-testid="details-diff-table"
    >
      <TableHeader>
        <TableRow>
          <TableHead className="w-[20%]">{translate('Field')}</TableHead>
          <TableHead className="w-[40%]">
            {beforeLabel ?? translate('Before')}
          </TableHead>
          <TableHead className="w-[40%]">
            {afterLabel ?? translate('After')}
            {afterNote && <span className="ms-1">{afterNote}</span>}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => {
          const beforeVal = beforeObj[key];
          const afterVal = afterObj[key];
          const differs =
            hasBoth && sortedStringify(beforeVal) !== sortedStringify(afterVal);
          return (
            <TableRow
              key={key}
              className={differs ? 'table-warning' : undefined}
            >
              <TableCell className="align-top">{key}</TableCell>
              <TableCell className="align-top">
                {renderValue(beforeVal)}
              </TableCell>
              <TableCell className="align-top">
                {renderValue(afterVal)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
