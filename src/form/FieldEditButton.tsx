import { useId } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton, getEditLabel } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { FieldEditButtonProps } from './FieldEditButton.types';

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

/**
 * The pencil is icon-only, so it is named after the field it edits ("Edit
 * Name"). The `tooltip` is shown on hover and, when the button is disabled,
 * says why. It is also the button's description, so a screen reader hears
 * the reason even though a disabled button cannot be focused to open the
 * tooltip.
 */
export const FieldEditButton = (props: FieldEditButtonProps) => {
  const { openDialog } = useModal();
  const descriptionId = useId();
  const callback = () => {
    openDialog(EditFieldDialog, {
      resolve: props,
    });
  };
  return (
    <>
      <CompactEditButton
        onClick={callback}
        disabled={props.disabled}
        variant="secondary"
        tooltip={props.tooltip}
        aria-label={getEditLabel(props.title ?? props.label)}
        aria-describedby={props.tooltip ? descriptionId : undefined}
        iconNode={props.iconNode}
        data-testid={`edit-${props.name}`}
      />
      {props.tooltip && (
        <span id={descriptionId} className="sr-only">
          {props.tooltip}
        </span>
      )}
    </>
  );
};
