import { QuestionIcon } from '@phosphor-icons/react';
import createDecorator from 'final-form-calculate';
import { useMemo } from 'react';
import { Form } from 'react-final-form';

import { Tooltip } from 'waldur-ui';

import { required } from '@/core/validators';
import { SubmitButton, SelectGroup, BooleanGroup, RadioGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { EXPORT_OPTIONS } from './exporters/constants';
import { ExportConfig, ExportFormat } from './exporters/types';
import { TableProps } from './types';
import { useTableExport } from './useTableExport';

interface ExportDialogProps {
  resolve: {
    table: string;
    format: ExportFormat;
    ownProps?: Partial<TableProps>;
  };
}

export const ExportDialog = (props: ExportDialogProps) => {
  const fullExport = props.resolve.ownProps?.fullExport;

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
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Export as')}
            footer={
              <>
                <CloseDialogButton disabled={submitting} />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={
                    submitting ? translate('Exporting...') : translate('Export')
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
                  gap={3}
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
                    <Tooltip
                      label={
                        values.content === 'full'
                          ? translate(
                              'The full report always covers every page',
                            )
                          : translate(
                              'Disable this to export only the rows on the current page',
                            )
                      }
                    >
                      <QuestionIcon size={20} weight="bold" className="ms-2" />
                    </Tooltip>
                  </>
                }
                hideLabel
                disabled={submitting || values.content === 'full'}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
