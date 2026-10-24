import createDecorator from 'final-form-calculate';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';

import { translate } from 'waldur-i18n-runtime';
import { AlertItem, HelpIcon } from 'waldur-ui';

import { required } from '@/core/validators';
import { SubmitButton, SelectGroup, BooleanGroup, RadioGroup } from '@/form';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { EXPORT_OPTIONS } from './exporters/constants';
import { getPdfSizeWarning } from './exporters/pdfLimits';
import { ExportConfig, ExportFormat } from './exporters/types';
import { getTableState } from './selectors';
import { TableProps } from './types';
import { getExportColumnCount, useTableExport } from './useTableExport';

interface ExportDialogProps {
  resolve: {
    table: string;
    format: ExportFormat;
    ownProps?: Partial<TableProps>;
  };
}

export const ExportDialog = (props: ExportDialogProps) => {
  const fullExport = props.resolve.ownProps?.fullExport;
  const tableState = useSelector(getTableState(props.resolve.table));

  // Caught before any row is fetched. Without the table filters the row
  // count is not known up front; the exporter checks the exact numbers again
  // before it sends anything.
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
      format: props.resolve?.format,
      withFilters: true,
      allPages: true,
      content: 'visible' as const,
    }),
    [props.resolve],
  );

  // Derived rather than unmounted, so the dialog keeps its height.
  const decorators = useMemo<any[]>(
    () => [
      createDecorator({
        field: 'content',
        updates: {
          format: (content, values: any) =>
            content === 'full' ? 'csv' : values.format,
          allPages: (content, values: any) =>
            content === 'full' ? true : values.allPages,
        },
      }),
    ],
    [],
  );

  const callback = useTableExport(props.resolve.table, props.resolve.ownProps);

  return (
    <Form<ExportConfig>
      onSubmit={callback}
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
                  <CloseDialogButton disabled={submitting} />
                  <SubmitButton
                    disabled={invalid || Boolean(pdfWarning)}
                    submitting={submitting}
                    label={
                      submitting
                        ? translate('Exporting...')
                        : translate('Export')
                    }
                  />
                </>
              }
            >
              <div className="size-sm">
                {/* Only for tables with more to write than their columns. */}
                {fullExport && (
                  <RadioGroup
                    name="content"
                    label={translate('Content')}
                    disabled={submitting}
                    // Without it each description crowds the next option's label.
                    choices={[
                      {
                        value: 'visible',
                        label: translate('Visible columns'),
                        description: translate(
                          'The columns shown in the table, in any format.',
                        ),
                      },
                      {
                        value: 'full',
                        label: fullExport.label,
                        // Said before the choice, not after.
                        description: [
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
                    className="mb-4"
                    title={pdfWarning}
                  />
                )}

                <BooleanGroup
                  name="withFilters"
                  label={translate('Apply table filters')}
                  hideLabel
                  disabled={submitting}
                />

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
                        className="ms-2"
                      />
                    </>
                  }
                  hideLabel
                  disabled={submitting || values.content === 'full'}
                />
              </div>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
