import { lazyComponent } from '@waldur/core/lazyComponent';
import type { ListConfiguration } from '@waldur/form/list-field/types';
import { openModalDialog } from '@waldur/modal/actions';

const ListFieldModal = lazyComponent(
  () => import(/* webpackChunkName: "ListFieldModal" */ './ListFieldModal'),
  'ListFieldModal',
);

export const openListFieldModal = (
  configuration: ListConfiguration,
  onOptionSelected: any,
) =>
  openModalDialog(ListFieldModal, {
    resolve: {
      configuration,
      onOptionSelected,
    },
  });
