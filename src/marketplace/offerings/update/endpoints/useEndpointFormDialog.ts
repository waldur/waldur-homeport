import { useCallback } from 'react';
import { NestedEndpoint } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { ENDPOINT_FORM_ID } from './constants';

const EndpointFormDialog = lazyComponent(() =>
  import('./EndpointFormDialog').then((module) => ({
    default: module.EndpointFormDialog,
  })),
);

/** Opens the endpoint form: add mode without `endpoint`, edit mode with it. */
export const useEndpointFormDialog = () => {
  const { openDialog } = useModal();
  return useCallback(
    (resolve: { offering; refetch; endpoint?: NestedEndpoint }) =>
      openDialog(EndpointFormDialog, { resolve, formId: ENDPOINT_FORM_ID }),
    [openDialog],
  );
};
