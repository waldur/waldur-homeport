import { PlusCircle } from '@phosphor-icons/react';
import { triggerTransition } from '@uirouter/redux';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const CreateResourceButton = ({ category_uuid }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          triggerTransition('marketplace-category-project', {
            category_uuid,
          }),
        )
      }
      iconNode={<PlusCircle />}
      title={translate('Add resource')}
      variant="primary"
    />
  );
};
