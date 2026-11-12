import createDecorator from 'final-form-calculate';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  BooleanGroup,
  RadioGroup,
  required,
  SelectGroup,
  SubmitButton,
} from 'waldur-form';
import { translate } from 'waldur-i18n-runtime';
import {
  AlertItem,
  CloseDialogButton,
  HelpIcon,
  ModalDialog,
  useModal,
  useModalHide,
} from 'waldur-ui';

import { EXPORT_OPTIONS } from './exporters/constants';
import { getPdfSizeWarning } from './exporters/pdfLimits';
import { ExportConfig, ExportFormat } from './exporters/types';
import { getTableState } from './selectors';
import { TableProps } from './types';
import { getExportColumnCount, useTableExport } from './useTableExport';

interface ExportDialogProps {
  resolve: {
    /** Left out to offer only `ownProps.fullExport`. */
    table?: string;
    format: ExportFormat;
    ownProps?: Partial<TableProps>;
  };
}

export const ExportDialog = (props: ExportDialogProps) => {
  const fullExport = props.resolve.ownProps?.fullExport;
  const fullFormat = fullExport?.format ?? 'csv';
  // Nothing but the full export: no table rows to pick from.
  const fullOnly = Boolean(fullExport) && !props.resolve.table;
  const tableState = useSelector(getTableState(props.resolve.table));

  // Caught before any row is fetched; the exporter checks the exact numbers
  // again before it sends anything.
  const getPdfWarning = (values: ExportConfig) => {
    if (values.format !== 'pdf' || values.content === 'full') return undefined;
    const ownProps = props.resolve.ownProps;
    const rows = values.allPages
      ? (tableState?.pagination?.resultCount ?? 0)
      : (ownProps?.rows?.length ?? 0);
    return getPdfSizeWarning(
      rows,
      getExportColumnCount(props.resolve.table, ownProps),
    );
  };

  const initialValues = useMemo(
    () => ({
      format: fullOnly ? fullFormat : props.resolve?.format,
      allPages: true,
      content: fullOnly ? ('full' as const) : ('visible' as const),
    }),
    [props.resolve, fullOnly, fullFormat],
  );

  // Derived rather than unmounted, so the dialog keeps its height.
  const decorators = useMemo<any[]>(
    () => [
      createDecorator({
        field: 'content',
        updates: {
          format: (content, values: any) =>
            content === 'full' ? fullFormat : values.format,
          allPages: (content, values: any) =>
            content === 'full' ? true : values.allPages,
        },
      }),
    ],
    [fullFormat],
  );

  const { exportTable, abort, progress } = useTableExport(
    props.resolve.table,
    props.resolve.ownProps,
  );
  const { closeDialog } = useModal();
  const hide = useModalHide();
  // Stops the export at once rather than when the closing dialog unmounts.
  const cancel = () => {
    abort();
    (hide ?? closeDialog)();
  };

  return (
    <Form<ExportConfig>
      onSubmit={exportTable}
      initialValues={initialValues}
      decorators={decorators}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const pdfWarning = getPdfWarning(values);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Export as')}
              footer={
                <>
                  <CloseDialogButton onClick={cancel} />
                  <SubmitButton
                    disabled={invalid || Boolean(pdfWarning)}
                    submitting={submitting}
                    label={
                      !submitting
                        ? translate('Export')
                        : progress?.total
                          ? translate(
                              'Exporting {fetched} of {total} rows...',
                              {
                                fetched: progress.fetched,
                                total: progress.total,
                              },
                            )
                          : translate('Exporting...')
                    }
                  />
                </>
              }
            >
              <div>
                {/* Only for tables with more to write than their columns. */}
                {fullExport && (
                  <RadioGroup
                    name="content"
                    label={translate('Content')}
                    disabled={submitting}
                    // Without it each description crowds the next option's label.
                    choices={[
                      ...(fullOnly
                        ? []
                        : [
                            {
                              value: 'visible',
                              label: translate('Visible columns'),
                              description: translate(
                                'The columns shown in the table, in any format.',
                              ),
                            },
                          ]),
                      {
                        value: 'full',
                        label: fullExport.label,
                        // Said before the choice, not after. Another format
                        // than CSV says what it holds in its own description.
                        description: fullExport.format
                          ? fullExport.description
                          : [
                              fullExport.description,
                              translate('CSV, every page.'),
                            ]
                              .filter(Boolean)
                              .join(' '),
                      },
                    ]}
                  />
                )}

                <SelectGroup
                  name="format"
                  label={translate('Format')}
                  simpleValue={true}
                  options={EXPORT_OPTIONS}
                  required={true}
                  isClearable={false}
                  validate={required}
                  isDisabled={submitting || values.content === 'full'}
                />

                {pdfWarning && (
                  <AlertItem
                    type="floating"
                    variant="warning"
                    className="mb-3"
                    title={pdfWarning}
                  />
                )}

                {/* A full export in a format of its own is the whole thing,
                    whatever the table's filters and pages: there is nothing
                    to choose. */}
                {!fullOnly &&
                  !(values.content === 'full' && fullExport?.format) && (
                    <BooleanGroup
                      name="allPages"
                      label={
                        <>
                          {translate('All pages')}
                          <HelpIcon
                            label={
                              values.content === 'full'
                                ? translate(
                                    'The full report always covers every page',
                                  )
                                : translate(
                                    'Disable this to export only the rows on the current page',
                                  )
                            }
                            size={20}
                            className="ms-1.5"
                          />
                        </>
                      }
                      hideLabel
                      disabled={submitting || values.content === 'full'}
                    />
                  )}
              </div>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
