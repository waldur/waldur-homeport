import {ListConfiguration} from '@waldur/form-react/list-field/types';
import {openModalDialog} from '@waldur/modal/actions';

export const openListFieldModal = (configuration: ListConfiguration, onOptionSelected: any) => openModalDialog('ListFieldModal', {
  resolve: {
    configuration,
    onOptionSelected,
  },
});
