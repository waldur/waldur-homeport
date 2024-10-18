import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { lazyComponent } from '../../core/lazyComponent';

import { Component } from './types';

const AllComponentsDialog = lazyComponent(
  () => import('./AllComponentsDialog'),
  'AllComponentsDialog',
);

const showAllComponentsDialog = (components) =>
  openModalDialog(AllComponentsDialog, {
    resolve: { components },
    size: 'lg',
  });

export const AggregateLimitsShowMoreButton = ({
  components,
}: {
  components: Component[];
}) => {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="text-anchor fw-bold"
      onClick={() => dispatch(showAllComponentsDialog(components))}
    >
      {translate('Show more')}
    </button>
  );
};
