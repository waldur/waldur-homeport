import { QuestionIcon } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { SelectField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { type RootState } from '@/store/reducers';

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

export const ExportDialog = connect<
  { tableState: TableState },
  {},
  ExportDialogProps
>((state: RootState, ownProps) => ({
  initialValues: {
    format: ownProps.resolve?.format,
    withFilters: true,
    allPages: true,
  },
  tableState: state.tables[ownProps.resolve.table],
}))(
  reduxForm<ExportConfig, ExportDialogProps & { tableState: TableState }>({
    form: 'tableExportForm',
  })((props) => {
    const callback = useTableExport(
      props.resolve.table,
      props.resolve.ownProps,
    );
    return (
      <form onSubmit={props.handleSubmit(callback)}>
        <ModalDialog
          title={translate('Export as')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={
                props.submitting
                  ? translate('Exporting...')
                  : translate('Export')
              }
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <SelectField
              name="format"
              label={translate('Format')}
              simpleValue={true}
              options={EXPORT_OPTIONS}
              required={true}
              isClearable={false}
              validate={required}
            />

            <AwesomeCheckboxField
              name="withFilters"
              label={translate('Apply table filters')}
              hideLabel
            />

            <AwesomeCheckboxField
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
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
