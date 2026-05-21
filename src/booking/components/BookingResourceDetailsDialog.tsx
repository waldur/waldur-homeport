import { FC } from 'react';

import { BookingStateField } from '@/booking/BookingStateField';
import { BookingResource } from '@/booking/types';
import { parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useCustomer } from '@/workspace/hooks';

import { BOOKING_CREATING } from '../constants';

import { AcceptBookingButton } from './AcceptBookingButton';
import { RejectBookingButton } from './RejectBookingButton';

interface OwnProps {
  resolve: {
    bookingResource: BookingResource;
    fromServiceProvider: boolean;
    refetch?;
  };
}

export const BookingResourceDetailsDialog: FC<OwnProps> = (props) => {
  const resource = props.resolve.bookingResource;

  const customer = useCustomer();
  const isServiceProviderContext =
    resource.provider_uuid === customer.uuid ||
    props.resolve.fromServiceProvider;

  return (
    <ModalDialog
      title={resource.name}
      footerClassName="justify-content-between"
      footer={
        <>
          <div>
            {isServiceProviderContext && (
              <AcceptBookingButton
                resourceUuid={resource.uuid}
                pending={resource.state !== BOOKING_CREATING}
                refetch={props.resolve.refetch}
              />
            )}
            <RejectBookingButton
              resourceUuid={resource.uuid}
              pending={resource.state !== BOOKING_CREATING}
              isServiceProviderContext={isServiceProviderContext}
              refetch={props.resolve.refetch}
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
