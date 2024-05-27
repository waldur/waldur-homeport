import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceComponentsDialog = lazyComponent(
  () => import('./ResourceComponentsDialog'),
  'ResourceComponentsDialog',
);

const showResourceComponentsDialog = (resource, components) =>
  openModalDialog(ResourceComponentsDialog, {
    resolve: { resource, components },
    size: 'lg',
  });

export const ResourceShowMoreComponents = ({
  resource,
  components,
}: {
  resource: { current_usages: Limits; limits: Limits; limit_usage: Limits };
  components: OfferingComponent[];
}) => {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="text-link"
      onClick={() =>
        dispatch(showResourceComponentsDialog(resource, components))
      }
    >
      {translate('Show more')}
    </button>
  );
};
