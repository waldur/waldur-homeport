import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CreateImageDialog = lazyComponent(
  () => import('./CreateImageDialog'),
  'CreateImageDialog',
);

interface CreateImageButtonProps {
  offering: Offering;
}

export const CreateImageButton = (props: CreateImageButtonProps) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(CreateImageDialog, {
        resolve: props,
        size: 'lg',
      }),
    );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
      }}
    >
      <ActionButton
        title={translate('Add image')}
        icon="fa fa-plus"
        action={callback}
      />
    </div>
  );
};
