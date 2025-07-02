import { DateTime } from 'luxon';
import { FunctionComponent, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import {
  Field,
  reduxForm,
  InjectedFormProps,
  formValueSelector,
} from 'redux-form';
import { Resource } from 'waldur-js-client';

import { formatISODate, parseDate } from '@waldur/core/dateUtils';
import { WarnCard } from '@waldur/core/WarnCard';
import { FormContainer, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_RESOURCE_END_DATE_FORM_ID } from './constants';

type OwnProps = {
  resolve: {
    resource: Resource;
    refetch?(): void;
    updateEndDate?(uuid: string, date: string);
  };
};

type StateProps = ReturnType<typeof mapStateToProps>;

interface FormData {
  end_date: string;
}

const endDateSelector = (state) =>
  formValueSelector(EDIT_RESOURCE_END_DATE_FORM_ID)(state, 'end_date');

const PureEditResourceEndDateDialog: FunctionComponent<
  InjectedFormProps<{}> & OwnProps & StateProps
> = (props) => {
  const dispatch = useDispatch();
  const value = useSelector(endDateSelector);

  const exceedsProjectEndDate = useMemo(() => {
    if (!value || !props.resolve.resource?.project_end_date) return false;
    return (
      parseDate(value) > parseDate(props.resolve.resource?.project_end_date)
    );
  }, [value, props.resolve.resource]);

  const submitRequest = async (formData: FormData) => {
    try {
      await props.resolve.updateEndDate(
        props.resolve.resource.uuid,
        formData.end_date ? formatISODate(formData.end_date) : null,
      );
      dispatch(
        showSuccess(
          translate('{resourceName} resource has been updated successfully.', {
            resourceName: props.resolve.resource.name,
          }),
        ),
      );
      if (props.resolve.refetch) {
        await props.resolve.refetch();
      }
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to edit resource.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Set termination date')}
        subtitle={
          <>
            <b>{translate('Resource name')}</b>: {props.resolve.resource.name}
          </>
        }
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
              disabled={props.invalid || exceedsProjectEndDate}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <Field
            name="end_date"
            label={translate('Termination date')}
            hideLabel
            spaceless
            component={DateField}
            disabled={props.submitting}
            description={
              exceedsProjectEndDate
                ? translate(
                    'Termination date is after end date. Resource will end with the project.',
                  )
                : translate(
                    'The date is inclusive. Once reached, resource will be scheduled for termination.',
                  )
            }
            minDate={DateTime.now().plus({ weeks: 1 }).toISO()}
            maxDate={
              props.resolve.resource?.project_end_date
                ? parseDate(props.resolve.resource.project_end_date).toISO()
                : undefined
            }
          />

          {exceedsProjectEndDate && (
            <WarnCard
              title={translate('Date conflict')}
              description={
                <>
                  {translate(
                    'The selected termination date ({terminationDate}) is after the project end date ({endDate}). The resource will be terminated on the project end date regardless of this setting.',
                    {
                      terminationDate: parseDate(value).toLocaleString(
                        DateTime.DATE_MED,
                      ),
                      endDate: parseDate(
                        props.resolve.resource.project_end_date,
                      ).toLocaleString(DateTime.DATE_MED),
                    },
                  )}
                  <button
                    className="text-anchor fw-bold d-block mt-2"
                    type="button"
                    onClick={() => {
                      props.change(
                        'end_date',
                        props.resolve.resource?.project_end_date,
                      );
                    }}
                  >
                    {translate('Use project date')}
                  </button>
                </>
              }
              className="mt-5"
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    end_date: ownProps.resolve.resource.end_date,
  },
});

const connector = connect<StateProps, {}, OwnProps>(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<FormData, OwnProps>({
    form: EDIT_RESOURCE_END_DATE_FORM_ID,
  }),
);

export const EditResourceEndDateDialog = enhance(PureEditResourceEndDateDialog);
