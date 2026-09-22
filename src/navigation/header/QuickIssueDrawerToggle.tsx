import { ChatsCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { Tooltip } from 'waldur-ui';

import { useDrawer, useIsDrawerOpenWith } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { isDrawerOpenWithClass } from '@/drawer/utils';
import { translate } from '@/i18n';
import { useMatrixTotalUnread } from '@/matrix/chat/useMatrixTotalUnread';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { openSupportDrawer } from '@/support/openSupportDrawer';

export const QuickIssueDrawerToggle: React.FC = () => {
  const { openDrawer, closeDrawer } = useDrawer();
  const isOpen = useIsDrawerOpenWith(DRAWER_SHELL_CLASS.support);
  const matrixUnread = useMatrixTotalUnread();
  const showChatBullet = isMatrixChatEnabled() && matrixUnread > 0;

  const toggleSupportDrawer = () => {
    if (isDrawerOpenWithClass(DRAWER_SHELL_CLASS.support)) {
      closeDrawer();
    } else {
      openSupportDrawer(openDrawer);
    }
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <Tooltip label={translate('Support')} side="bottom">
        <button
          id="quick-issue-toggle"
          type="button"
          onClick={toggleSupportDrawer}
          aria-label={translate('Support')}
          aria-expanded={isOpen}
          data-drawer-toggle
          className="position-relative btn-nav-item"
        >
          <span className="svg-icon svg-icon-2">
            <ChatsCircleIcon weight="bold" />
          </span>
          {showChatBullet && <HeaderButtonBullet />}
        </button>
      </Tooltip>
    </div>
  );
};
