import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const EditPlanDescriptionDialog = lazyComponent(() =>
  import('./EditPlanDescriptionDialog').then((module) => ({
    default: module.EditPlanDescriptionDialog,
  })),
);

export const EditPlanDescriptionButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditPlanDescriptionDialog, {
      resolve: { offering, plan, refetch },
      size: 'lg',
    });
  };
  return (
    <Dropdown.Item onClick={callback}>
      <PencilSimpleIcon size={18} weight="bold" /> {translate('Edit')}
    </Dropdown.Item>
  );
};
