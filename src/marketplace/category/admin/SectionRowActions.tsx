import {
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NestedSection } from 'waldur-js-client';
import { marketplaceSectionsDestroy } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const SectionFormDialog = lazyComponent(() =>
  import('./SectionFormDialog').then((module) => ({
    default: module.SectionFormDialog,
  })),
);

const AttributeFormDialog = lazyComponent(() =>
  import('./AttributeFormDialog').then((module) => ({
    default: module.AttributeFormDialog,
  })),
);

interface SectionRowActionsProps {
  row: NestedSection;
  category: Category;
  refetch?: () => void;
}

const AttributeAddAction = (props: SectionRowActionsProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(AttributeFormDialog, {
        resolve: {
          section: props.row,
          category: props.category,
          refetch: props.refetch,
        },
      }),
    );
  }, [dispatch, props.row, props.category, props.refetch]);

  return (
    <ActionItem
      title={translate('Add attribute')}
      action={handleClick}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

const SectionEditAction = (props: SectionRowActionsProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(SectionFormDialog, {
        resolve: {
          category: props.category,
          section: props.row,
          refetch: props.refetch,
        },
      }),
    );
  }, [dispatch, props.category, props.row, props.refetch]);

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleClick}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

const SectionDeleteAction = (props: SectionRowActionsProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} section?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setRemoving(true);
    try {
      await marketplaceSectionsDestroy({ path: { key: props.row.key } });

      props.refetch?.();
      dispatch(showSuccess(translate('The section has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove section.')));
    } finally {
      setRemoving(false);
    }
  }, [dispatch, props.row, props.category, props.refetch]);

  return (
    <ActionItem
      title={translate('Delete')}
      className="text-danger"
      action={handleClick}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      disabled={removing}
    />
  );
};

export const SectionRowActions = (props: SectionRowActionsProps) => (
  <ActionsDropdown
    row={props.row}
    refetch={props.refetch}
    data={{ category: props.category }}
    actions={[SectionEditAction, SectionDeleteAction, AttributeAddAction]}
  />
);
