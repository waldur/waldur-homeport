import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { pick } from '@/core/utils';
import { FormContainer, FormFooter } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { EDIT_SCHEDULES_FORM_ID } from './constants';
import { OfferingScheduler } from './OfferingScheduler';

const formatSchedules = (schedules: any[]) =>
  schedules
    .filter((item) => Object.keys(item).length > 0)
    .map(pick(['start', 'end', 'title', 'allDay', 'extendedProps', 'id']));

export const EditSchedulesDialog = connect(
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      schedules: ownProps.resolve.offering.attributes?.schedules.map((sch) => {
        // Convert string dates to JS Dates
        if (typeof sch.start === 'string') sch.start = new Date(sch.start);
        if (typeof sch.end === 'string') sch.end = new Date(sch.end);
        return sch;
      }),
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; refetch } }>({
    form: EDIT_SCHEDULES_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await marketplaceProviderOfferingsUpdateAttributes({
            path: { uuid: props.resolve.offering.uuid },
            body: {
              ...props.resolve.offering.attributes,
              schedules: formatSchedules(formData.schedules),
            },
          });
          dispatch(
            showSuccess(translate('Schedules have been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update schedules.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={translate('Update schedule')}
          footer={
            <FormFooter
              submitting={props.submitting}
              submitLabel={translate('Update')}
            />
          }
        >
          <FormContainer {...props} className="size-xl">
            <FieldArray
              name="schedules"
              rerenderOnEveryChange
              component={OfferingScheduler}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
