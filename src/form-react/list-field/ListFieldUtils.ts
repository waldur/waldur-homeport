import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { openModalDialog } from '@waldur/modal/actions';

import { ListFieldModal } from './ListFieldModal';

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
