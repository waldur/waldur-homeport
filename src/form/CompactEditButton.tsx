import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, ReactNode } from 'react';

import { BaseButton, BaseButtonProps, ButtonVariant } from 'waldur-ui';

import { translate } from '@/i18n';

export interface CompactEditButtonProps extends Omit<
  BaseButtonProps,
  'size' | 'label'
> {
  iconNode?: ReactNode;
  variant?: ButtonVariant;
  /**
   * The field this pencil edits. It names the icon-only button "Edit
   * <field>" (as its tooltip) unless an explicit `tooltip` is given.
   */
  fieldName?: ReactNode;
  'data-testid'?: string;
}

/**
 * "Edit <field>", or plain "Edit" when the field's name is not text (an
 * element, or blank), so an icon-only pencil always has a name.
 */
export const getEditLabel = (fieldName: ReactNode) =>
  typeof fieldName === 'string' && fieldName.trim()
    ? translate('Edit {name}', { name: fieldName })
    : translate('Edit');

/**
 * Compact edit button for inline field editing in forms, settings rows, and data tables.
 * Uses small size to fit alongside form fields without dominating the layout.
 */
export const CompactEditButton: FunctionComponent<CompactEditButtonProps> = ({
  iconNode = <PencilSimpleIcon weight="bold" />,
  variant = 'tertiary',
  fieldName,
  tooltip,
  'data-testid': dataTestId = 'compact-edit-button',
  ...props
}) => (
  <BaseButton
    size="sm"
    variant={variant}
    iconNode={iconNode}
    tooltip={
      tooltip ?? (fieldName !== undefined ? getEditLabel(fieldName) : undefined)
    }
    data-testid={dataTestId}
    {...props}
  />
);
