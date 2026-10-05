import {
  DownloadSimpleIcon,
  FileCsvIcon,
  FilePdfIcon,
  FilePngIcon,
  FileXlsIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { ButtonSize, Menu } from 'waldur-ui';

import { translate } from '@/i18n';

export interface ChartExportDropdownProps {
  onExportPng?: () => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
  label?: ReactNode;
  icon?: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export const ChartExportDropdown: FC<ChartExportDropdownProps> = ({
  onExportPng,
  onExportPdf,
  onExportCsv,
  onExportExcel,
  disabled,
  size = 'md',
  className = 'w-auto',
  label = translate('Export'),
  icon = <DownloadSimpleIcon weight="bold" />,
  align = 'end',
}) => {
  const hasOptions = Boolean(
    onExportPng || onExportPdf || onExportCsv || onExportExcel,
  );

  if (!hasOptions) return null;

  return (
    <Menu>
      <Menu.TriggerButton
        disabled={disabled}
        size={size}
        className={className}
        icon={icon}
      >
        {label}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom" align={align}>
        {onExportPng && (
          <Menu.Item
            icon={<FilePngIcon weight="bold" />}
            onSelect={onExportPng}
          >
            {translate('PNG')}
          </Menu.Item>
        )}
        {onExportPdf && (
          <Menu.Item
            icon={<FilePdfIcon weight="bold" />}
            onSelect={onExportPdf}
          >
            {translate('PDF')}
          </Menu.Item>
        )}
        {onExportCsv && (
          <Menu.Item
            icon={<FileCsvIcon weight="bold" />}
            onSelect={onExportCsv}
          >
            {translate('CSV')}
          </Menu.Item>
        )}
        {onExportExcel && (
          <Menu.Item
            icon={<FileXlsIcon weight="bold" />}
            onSelect={onExportExcel}
          >
            {translate('Excel')}
          </Menu.Item>
        )}
      </Menu.Content>
    </Menu>
  );
};
