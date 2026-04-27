import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  proposalRequestedOfferingsAccept,
  proposalRequestedOfferingsCancel,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';

interface OfferingRequestItemActionsProps {
  row: ProviderRequestedOffering;
  fetch;
}

const AcceptOfferingRequestAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const { mutate: accept, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Accepting offering request'),
          translate(
            'Are you sure you want to accept the {name} offering request?',
            {
              name: <b>{row.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalRequestedOfferingsAccept({ path: { uuid: row.uuid } });
        refetch();
        dispatch(showSuccess(translate('Offering request has been accepted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to accept offering request.'),
          ),
        );
      }
    },
  });
  return (
    <ActionItem
      action={accept}
      title={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
      disabled={isPending}
    />
  );
};

const RejectOfferingRequestAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const { mutate: reject, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Rejecting offering request'),
          translate(
            'Are you sure you want to reject the {name} offering request?',
            {
              name: <b>{row.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalRequestedOfferingsCancel({ path: { uuid: row.uuid } });
        refetch();
        dispatch(showSuccess(translate('Offering request has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject offering request.'),
          ),
        );
      }
    },
  });
  return (
    <ActionItem
      action={reject}
      title={translate('Reject')}
      iconNode={<XIcon weight="bold" />}
      className="text-danger"
      disabled={isPending}
    />
  );
};

export const OfferingRequestItemActions = ({
  row,
  fetch,
}: OfferingRequestItemActionsProps) => {
  return row.state === 'requested' ? (
    <ActionsDropdown row={row} refetch={fetch}>
      <AcceptOfferingRequestAction row={row} refetch={fetch} />
      <RejectOfferingRequestAction row={row} refetch={fetch} />
    </ActionsDropdown>
  ) : null;
};
