import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Form } from 'react-final-form';

import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { SubmitButton, SelectGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { EXPORT_OPTIONS } from './exporters/constants';
import { ExportConfig, ExportFormat } from './exporters/types';
import { TableState } from './types';
import { useTableExport } from './useTableExport';

interface ExportDialogProps {
  resolve: {
    table: string;
    format: ExportFormat;
    ownProps?: Partial<TableState>;
  };
}

export const ExportDialog = (props: ExportDialogProps) => {
  const initialValues = useMemo(
    () => ({
      format: props.resolve?.format,
      withFilters: true,
      allPages: true,
    }),
    [props.resolve],
  );

  const callback = useTableExport(props.resolve.table, props.resolve.ownProps);

  return (
    <Form<ExportConfig>
      onSubmit={callback}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Export as')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={
                  submitting ? translate('Exporting...') : translate('Export')
                }
              />
            }
          >
            <div className="size-sm">
              <SelectGroup
                name="format"
                label={translate('Format')}
                simpleValue={true}
                options={EXPORT_OPTIONS}
                required={true}
                isClearable={false}
                validate={required}
                isDisabled={submitting}
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
                    <Tip
                      label={translate(
                        'Disable this to export only the rows on the current page',
                      )}
                      className="ms-2"
                      id="tip-export-table-all-page"
                    >
                      <QuestionIcon size={20} weight="bold" />
                    </Tip>
                  </>
                }
                hideLabel
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
