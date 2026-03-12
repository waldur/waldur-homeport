import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CategoryDeleteAction } from './CategoryDeleteAction';
import { CategoryEditAction } from './CategoryEditAction';

const SectionFormDialog = lazyComponent(() =>
  import('./SectionFormDialog').then((module) => ({
    default: module.SectionFormDialog,
  })),
);

const CategoryAddSectionAction = ({
  row,
  refetch,
}: {
  row: Category;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(SectionFormDialog, {
        resolve: {
          category: row,
          refetch,
        },
      }),
    );
  }, [dispatch, row, refetch]);

  return (
    <ActionItem
      title={translate('Add section')}
      action={handleClick}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

export const CategoryRowActions = ({
  row,
  refetch,
}: {
  row: Category;
  refetch: () => void;
}) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      CategoryEditAction,
      CategoryDeleteAction,
      CategoryAddSectionAction,
    ].filter(Boolean)}
  />
);
