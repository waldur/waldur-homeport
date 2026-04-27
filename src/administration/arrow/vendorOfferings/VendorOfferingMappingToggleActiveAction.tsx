import { ToggleLeftIcon, ToggleRightIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  adminArrowVendorOfferingMappingsPartialUpdate,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const VendorOfferingMappingToggleActiveAction = ({
  row,
  refetch,
}: {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      adminArrowVendorOfferingMappingsPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_active: !row.is_active },
      }),
    onSuccess: () => {
      dispatch(showSuccess(translate('Mapping status updated.')));
      refetch();
    },
    onError: (error: Response) => {
      dispatch(
        showErrorResponse(error, translate('Unable to update mapping status.')),
      );
    },
  });

  return (
    <ActionItem
      title={row.is_active ? translate('Deactivate') : translate('Activate')}
      action={() => mutate()}
      iconNode={
        row.is_active ? (
          <ToggleLeftIcon weight="bold" />
        ) : (
          <ToggleRightIcon weight="bold" />
        )
      }
      disabled={isPending}
    />
  );
};
