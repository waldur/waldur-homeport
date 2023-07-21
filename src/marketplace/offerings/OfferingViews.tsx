import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { isDescendantOf } from '@waldur/navigation/useTabs';

import { getFormComponent } from '../common/registry';

import { ActionsDropdown } from './actions/ActionsDropdown';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const OfferingViews = ({ row }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const FormComponent = getFormComponent(row.type);
  const actions = [
    {
      label: translate('View ordering form'),
      handler: () =>
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering: row },
            size: 'lg',
          }),
        ),
      visible: Boolean(FormComponent),
    },
    {
      label: translate('Edit'),
      handler: () => {
        const target = isDescendantOf('admin', state)
          ? 'admin.marketplace-offering-update'
          : 'marketplace-offering-update';
        router.stateService.go(target, { offering_uuid: row.uuid });
      },
      visible: ![
        'marketplace-offering-update',
        'admin.marketplace-offering-update',
      ].includes(state.name),
    },
    {
      label: translate('Details'),
      handler: () => {
        const target = isDescendantOf('admin', state)
          ? 'admin.marketplace-offering-details'
          : 'marketplace-offering-details';
        router.stateService.go(target, { offering_uuid: row.uuid });
      },
      visible: ![
        'marketplace-offering-details',
        'admin.marketplace-offering-details',
      ].includes(state.name),
    },
  ].filter(({ visible }) => visible);
  return <ActionsDropdown actions={actions} />;
};
