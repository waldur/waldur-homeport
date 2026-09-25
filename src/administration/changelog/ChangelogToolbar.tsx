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

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

import { ScheduleUpgradeDialog } from './ScheduleUpgradeDialog';
import { UpgradeCommandsDialog } from './UpgradeCommandsDialog';

const downloadMarkdown = (filename: string, markdown: string) => {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

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
        downloadMarkdown(
          `waldur-upgrade-${report.current_version}-to-${report.latest_version}.md`,
          report.report,
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
      <ActionDropdownButton
        variant="tertiary"
        title={translate('Actions')}
        disabled={loading}
      >
        <ActionItem
          title={translate('Upgrade commands')}
          action={openCommandsDialog}
          iconNode={<TerminalWindowIcon weight="bold" />}
        />
        <ActionItem
          title={translate('Download report')}
          action={downloadReport}
          iconNode={<DownloadIcon weight="bold" />}
        />
      </ActionDropdownButton>
      <ActionButton
        title={translate('Schedule upgrade')}
        iconNode={<CalendarPlusIcon weight="bold" />}
        action={openScheduleDialog}
        pending={loading}
        variant="primary"
      />
    </>
  );
};
