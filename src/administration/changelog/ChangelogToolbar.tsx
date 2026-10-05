import {
  CalendarPlusIcon,
  DownloadIcon,
  TerminalWindowIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import {
  ChangelogUpgradeReport,
  changelogUpgradeReportRetrieve,
} from 'waldur-js-client';

import { BaseButton, Menu } from 'waldur-ui';

import { saveFile } from '@/core/saveFile';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { ScheduleUpgradeDialog } from './ScheduleUpgradeDialog';
import { UpgradeCommandsDialog } from './UpgradeCommandsDialog';

export const ChangelogToolbar: FC = () => {
  const { openDialog } = useModal();
  const { showErrorResponse } = useNotify();
  const [loading, setLoading] = useState(false);

  // The report, the announcement and the commands all describe the whole
  // upgrade, so the backend builds them from every pending entry - whatever
  // page or filter the table is showing.
  const withReport = useCallback(
    async (action: (report: ChangelogUpgradeReport) => void) => {
      setLoading(true);
      try {
        const { data } = await changelogUpgradeReportRetrieve();
        action(data);
      } catch (error) {
        showErrorResponse(
          error,
          translate('Unable to load the upgrade report.'),
        );
      } finally {
        setLoading(false);
      }
    },
    [showErrorResponse],
  );

  const openCommandsDialog = useCallback(
    () =>
      withReport((report) =>
        openDialog(UpgradeCommandsDialog, {
          resolve: {
            latestVersion: report.latest_version,
            commands: report.commands,
          },
          size: 'lg',
        }),
      ),
    [withReport, openDialog],
  );

  const downloadReport = useCallback(
    () =>
      withReport((report) =>
        saveFile(
          new Blob([report.report], { type: 'text/markdown' }),
          `waldur-upgrade-${report.current_version}-to-${report.latest_version}.md`,
        ),
      ),
    [withReport],
  );

  const openScheduleDialog = useCallback(
    () =>
      withReport((report) =>
        openDialog(ScheduleUpgradeDialog, {
          resolve: {
            latestVersion: report.latest_version,
            announcement: report.announcement,
            announcementType: report.announcement_type,
          },
          size: 'lg',
        }),
      ),
    [withReport, openDialog],
  );

  return (
    <>
      <Menu>
        <Menu.TriggerButton variant="tertiary" size="lg" disabled={loading}>
          {translate('Actions')}
        </Menu.TriggerButton>
        <Menu.Content look="actions" side="bottom">
          <Menu.Item
            icon={<TerminalWindowIcon weight="bold" />}
            onSelect={openCommandsDialog}
          >
            {translate('Upgrade commands')}
          </Menu.Item>
          <Menu.Item
            icon={<DownloadIcon weight="bold" />}
            onSelect={downloadReport}
          >
            {translate('Download report')}
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <BaseButton
        label={translate('Schedule upgrade')}
        iconNode={<CalendarPlusIcon weight="bold" />}
        onClick={openScheduleDialog}
        pending={loading}
        variant="primary"
        size="lg"
      />
    </>
  );
};
