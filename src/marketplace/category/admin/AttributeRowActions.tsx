import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceAttributesDestroy,
  NestedAttribute,
  NestedSection,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const AttributeFormDialog = lazyComponent(() =>
  import('./AttributeFormDialog').then((module) => ({
    default: module.AttributeFormDialog,
  })),
);

interface AttributeRowActionsProps {
  row: NestedAttribute;
  section: NestedSection;
  category: Category;
  refetch?: () => void;
}

const AttributeEditAction = (props: AttributeRowActionsProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(AttributeFormDialog, {
        resolve: {
          section: props.section,
          category: props.category,
          attribute: props.row,
          refetch: props.refetch,
        },
      }),
    );
  }, [dispatch, props.section, props.category, props.row, props.refetch]);

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleClick}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

const AttributeDeleteAction = (props: AttributeRowActionsProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} attribute?',
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
      const attributeUuid = (props.row as { uuid?: string }).uuid;
      if (!attributeUuid) {
        throw new Error('Attribute uuid is required for delete');
      }
      await marketplaceAttributesDestroy({ path: { uuid: attributeUuid } });

      props.refetch?.();
      dispatch(showSuccess(translate('The attribute has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove attribute.')));
    } finally {
      setRemoving(false);
    }
  }, [dispatch, props.row, props.refetch]);

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

export const AttributeRowActions = (props: AttributeRowActionsProps) => (
  <ActionsDropdown
    row={props.row}
    refetch={props.refetch}
    data={{
      section: props.section,
      category: props.category,
    }}
    actions={[AttributeEditAction, AttributeDeleteAction]}
  />
);
