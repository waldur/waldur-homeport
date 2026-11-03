import { CheckIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { ChangelogReleaseSummary } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

// The page shows either every entry pending for this deployment, or what one
// release introduced.
export const PENDING_VIEW = 'pending';

const STATUS_LABELS: Record<ChangelogReleaseSummary['status'], () => string> = {
  running: () => translate('running'),
  pending: () => translate('pending'),
  older: () => translate('older'),
};

const getReleaseLabel = (release: ChangelogReleaseSummary) => {
  const details = [STATUS_LABELS[release.status]?.()];
  if (release.date) {
    details.push(formatDate(release.date));
  }
  return `${release.version} (${details.join(', ')})`;
};

const getViewTitle = (view: string, releases: ChangelogReleaseSummary[]) => {
  if (view === PENDING_VIEW) {
    return translate('Pending upgrade');
  }
  const release = releases.find((r) => r.version === view);
  return release
    ? translate('Release {label}', { label: getReleaseLabel(release) })
    : translate('Release {version}', { version: view });
};

interface ReleasePickerProps {
  view: string;
  releases: ChangelogReleaseSummary[];
  hasPending: boolean;
  onChange: (view: string) => void;
}

export const ReleasePicker: FC<ReleasePickerProps> = ({
  view,
  releases,
  hasPending,
  onChange,
}) => {
  const current = getViewTitle(view, releases);
  const titles = [
    ...new Set([
      current,
      ...(hasPending ? [getViewTitle(PENDING_VIEW, releases)] : []),
      ...releases.map((release) => getViewTitle(release.version, releases)),
    ]),
  ];
  const selectedIcon = (selected: boolean) =>
    selected ? <CheckIcon weight="bold" /> : <span />;
  return (
    <Menu>
      <Menu.TriggerButton variant="tertiary" size="lg" className="max-w-full">
        {/* Every title stacked in one cell, the others invisible: the button
            keeps the width of the longest, so picking one moves nothing. */}
        <span className="grid min-w-0 text-start">
          {titles.map((title) => (
            <span
              key={title}
              className={classNames(
                'col-start-1 row-start-1 truncate',
                title !== current && 'invisible',
              )}
            >
              {title}
            </span>
          ))}
        </span>
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        {hasPending && (
          <Menu.Item
            icon={selectedIcon(view === PENDING_VIEW)}
            onSelect={() => onChange(PENDING_VIEW)}
          >
            {translate('Pending upgrade')}
          </Menu.Item>
        )}
        {releases.map((release) => (
          <Menu.Item
            key={release.version}
            icon={selectedIcon(view === release.version)}
            onSelect={() => onChange(release.version)}
          >
            {getReleaseLabel(release)}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu>
  );
};
