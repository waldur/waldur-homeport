import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const CreateResourceButton = ({ category_uuid }) => {
  const router = useRouter();
  return (
    <ActionButton
      action={() =>
        router.stateService.go('public.marketplace-category', {
          category_uuid,
        })
      }
      iconNode={<PlusCircle />}
      title={translate('Add resource')}
      variant="primary"
    />
  );
};
