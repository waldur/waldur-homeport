import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ENDPOINT_FORM_ID } from './constants';

const AddEndpointDialog = lazyComponent(() =>
  import('./AddEndpointDialog').then((module) => ({
    default: module.AddEndpointDialog,
  })),
);

export const AddEndpointButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddEndpointDialog, {
      resolve: { offering, refetch },
      formId: ENDPOINT_FORM_ID,
    });
  };
  return (
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add endpoint')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};
