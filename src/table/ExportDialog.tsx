import { QuestionIcon } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { type RootState } from '@waldur/store/reducers';

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
          closeButton
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
                    <QuestionIcon size={20} />
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
