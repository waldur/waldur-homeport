import { FC } from 'react';

import { Badge, Code } from 'waldur-ui';

import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { ParameterView, readParameter } from './templateDocument';

/** A dotted path that wraps at its dots, not inside a name. */
const pathWithBreaks = (path: string) =>
  path
    .split('.')
    .flatMap((part, index, parts) =>
      index < parts.length - 1 ? [part, '.', <wbr key={index} />] : [part],
    );

interface ParameterRow {
  index: number;
  parameter: ParameterView;
  problems: string[];
}

const getColumns = (withProblems: boolean): Column<ParameterRow>[] => [
  {
    title: translate('Key'),
    render: ({ row }) => (
      <Code className="text-xs">{renderFieldOrDash(row.parameter.key)}</Code>
    ),
    rowHeader: true,
  },
  ...(withProblems
    ? [
        {
          title: translate('Problems'),
          // Right after the key and wrapping, so a refused parameter is seen
          // without scrolling the table sideways.
          className: 'whitespace-normal min-w-56',
          render: ({ row }: { row: ParameterRow }) =>
            row.problems.length ? (
              <span
                className="flex flex-col gap-1 text-danger"
                data-testid="parameter-problems"
              >
                <Badge variant="danger" size="sm" className="self-start">
                  {translate('Invalid')}
                </Badge>
                {row.problems.map((problem, index) => (
                  <span key={index}>{problem}</span>
                ))}
              </span>
            ) : null,
        },
      ]
    : []),
  {
    title: translate('Label'),
    render: ({ row }) => renderFieldOrDash(row.parameter.label),
    className: 'whitespace-normal',
  },
  {
    title: translate('Type'),
    render: ({ row }) =>
      row.parameter.invalid ? renderFieldOrDash(null) : row.parameter.type,
  },
  {
    title: translate('Required'),
    render: ({ row }) =>
      row.parameter.invalid
        ? renderFieldOrDash(null)
        : typeof row.parameter.required === 'boolean'
          ? row.parameter.required
            ? translate('Yes')
            : translate('No')
          : row.parameter.required,
  },
  {
    title: translate('Default'),
    render: ({ row }) => renderFieldOrDash(row.parameter.default),
  },
  {
    title: translate('Target paths'),
    render: ({ row }) =>
      row.parameter.paths.length ? (
        <span className="flex flex-col gap-0.5">
          {row.parameter.paths.map((path, index) => (
            <Code key={index} className="text-xs break-words">
              {pathWithBreaks(path)}
            </Code>
          ))}
        </span>
      ) : (
        renderFieldOrDash(null)
      ),
    // Long paths wrap rather than push the table wider than the dialog.
    className: 'whitespace-normal min-w-48',
  },
];

interface OfferingTemplateParametersTableProps {
  /** The parameters as the API holds them, or as a document being typed
   * declares them: any item may be malformed, and each keeps its position. */
  parameters: unknown[];
  /** Messages from the API for a parameter, by its position in the list. */
  problems?: Record<number, string[]>;
  /** Scroll within a fixed height, for a dialog. A page section shows every
   * parameter instead. */
  scrollable?: boolean;
}

/** The parameters a template asks for when an offering is created from it. */
export const OfferingTemplateParametersTable: FC<
  OfferingTemplateParametersTableProps
> = ({ parameters, problems, scrollable = true }) => {
  const rows = parameters.map((item, index) => {
    const parameter = readParameter(item);
    const refusals = problems?.[index] ?? [];
    return {
      index,
      parameter,
      // An item that is not a mapping is refused whatever it holds; the
      // API's own message, once it has answered, says the same.
      problems:
        parameter.invalid && !refusals.length
          ? [translate('A parameter must be a mapping of its fields.')]
          : refusals,
    };
  });
  return (
    <div className={scrollable ? 'max-h-80 overflow-auto' : 'overflow-x-auto'}>
      <SimpleTable<ParameterRow>
        columns={getColumns(rows.some((row) => row.problems.length > 0))}
        rows={rows}
        rowKey="index"
      />
    </div>
  );
};
