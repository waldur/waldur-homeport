import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { acceptBooking, rejectBooking } from '@waldur/booking/api';
import { BookingStateField } from '@waldur/booking/BookingStateField';
import { BOOKING_CREATING } from '@waldur/booking/constants';
import { BookingResource } from '@waldur/booking/types';
import { parseDate } from '@waldur/core/dateUtils';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface OwnProps {
  resolve: {
    bookingResource: BookingResource;
    fromServiceProvider: boolean;
    refetch;
  };
}

export const BookingResourceDetailsDialog: FC<OwnProps> = (props) => {
  const resource = props.resolve.bookingResource;

  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceProviderContext =
    resource.provider_uuid === customer.uuid ||
    props.resolve.fromServiceProvider;

  const [submitting, setSubmitting] = useState({
    accept: false,
    reject: false,
  });

  const acceptRequest = () => {
    setSubmitting({ accept: true, reject: false });
    return acceptBooking(resource.uuid)
      .then(() => {
        setSubmitting({ accept: false, reject: false });
        props.resolve.refetch();
        dispatch(showSuccess(translate('Booking has been accepted.')));
        dispatch(closeModalDialog());
      })
      .catch((e) => {
        setSubmitting({ accept: false, reject: false });
        dispatch(showErrorResponse(e, translate('Unable to accept booking.')));
      });
  };
  const rejectRequest = () => {
    setSubmitting({ accept: false, reject: true });
    return rejectBooking(resource.uuid)
      .then(() => {
        setSubmitting({ accept: false, reject: false });
        props.resolve.refetch();
        dispatch(showSuccess(translate('Booking has been cancelled.')));
        dispatch(closeModalDialog());
      })
      .catch((e) => {
        setSubmitting({ accept: false, reject: false });
        dispatch(showErrorResponse(e, translate('Unable to cancel booking.')));
      });
  };

  return (
    <ModalDialog
      title={resource.name}
      footerClassName="justify-content-between"
      footer={
        <>
          <div>
            {isServiceProviderContext && (
              <SubmitButton
                disabled={
                  resource.state !== BOOKING_CREATING ||
                  !hasPermission(user, {
                    permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
                    customerId: customer.uuid,
                  }) ||
                  submitting.reject
                }
                submitting={submitting.accept}
                label={translate('Accept')}
                className="btn btn-success me-2"
                onClick={acceptRequest}
              />
            )}
            <SubmitButton
              disabled={
                resource.state !== BOOKING_CREATING || submitting.accept
              }
              submitting={submitting.reject}
              label={
                isServiceProviderContext
                  ? translate('Deny')
                  : translate('Cancel order')
              }
              className="btn btn-danger"
              onClick={rejectRequest}
            />
          </div>
          <CloseDialogButton label={translate('Close')} />
        </>
      }
    >
      <div className="d-flex justify-content-between mb-8">
        <div>
          {resource.attributes.schedules.map((sch, i) => (
            <span key={i} className="d-block fw-bold">
              {parseDate(sch.start).toFormat("dd'.'MM'.'yyyy HH:mm")}
              {' - '}
              {parseDate(sch.end).toFormat("dd'.'MM'.'yyyy HH:mm")}
            </span>
          ))}
        </div>
        <div>
          <BookingStateField row={resource} />
        </div>
      </div>

      <div className="mb-8">
        <div className="fw-bolder">{resource.customer_name}</div>
        <div>{resource.project_name}</div>
      </div>

      <div>
        <div>
          {translate('Booked by')}
          {': '}
          {resource.created_by_full_name}
        </div>
        <div>{resource.created_by_username}</div>
      </div>
    </ModalDialog>
  );
};
