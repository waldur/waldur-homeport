import { DownloadSimpleIcon } from '@phosphor-icons/react';
import React, { FC } from 'react';

import { ButtonSize } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  ActionsDropdownComponent,
  ActionsDropdownItem,
} from '@/table/ActionsDropdown';

export interface ChartExportDropdownProps {
  onExportPng?: () => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
}

export const ChartExportDropdown: FC<ChartExportDropdownProps> = ({
  onExportPng,
  onExportPdf,
  onExportCsv,
  onExportExcel,
  disabled,
  size = 'md',
  className = 'w-auto',
}) => {
  const hasOptions = Boolean(
    onExportPng || onExportPdf || onExportCsv || onExportExcel,
  );

  if (!hasOptions) return null;

  return (
    <ActionsDropdownComponent
      labeled
      disabled={disabled}
      align="end"
      drop="down"
      size={size}
      className={className}
      label={
        <>
          <span className="svg-icon svg-icon-2 me-1">
            <DownloadSimpleIcon weight="bold" />
          </span>
          {translate('Export')}
        </>
      }
    >
      {onExportPng && (
        <ActionsDropdownItem onSelect={onExportPng}>
          {translate('Export as PNG')}
        </ActionsDropdownItem>
      )}
      {onExportPdf && (
        <ActionsDropdownItem onSelect={onExportPdf}>
          {translate('Export as PDF')}
        </ActionsDropdownItem>
      )}
      {onExportCsv && (
        <ActionsDropdownItem onSelect={onExportCsv}>
          {translate('Export as CSV')}
        </ActionsDropdownItem>
      )}
      {onExportExcel && (
        <ActionsDropdownItem onSelect={onExportExcel}>
          {translate('Export as XLSX')}
        </ActionsDropdownItem>
      )}
    </ActionsDropdownComponent>
  );
};
