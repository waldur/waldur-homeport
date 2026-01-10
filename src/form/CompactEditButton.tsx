import { FunctionComponent } from 'react';

import { EditButton, EditButtonProps } from './EditButton';

type CompactEditButtonProps = Omit<EditButtonProps, 'size'>;

/**
 * Compact edit button for inline field editing in forms, settings rows, and data tables.
 * Uses small size to fit alongside form fields without dominating the layout.
 *
 * For panel/card header actions or toolbars, use EditButton instead (which defaults to large size).
 */
export const CompactEditButton: FunctionComponent<CompactEditButtonProps> = (
  props,
) => <EditButton {...props} size="sm" />;
