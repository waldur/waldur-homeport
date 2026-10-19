import { ChatsCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { IconButton } from 'waldur-ui';

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
    <div className="flex items-center ms-[0.25rem]">
      <IconButton
        id="quick-issue-toggle"
        label={translate('Support')}
        onClick={toggleSupportDrawer}
        aria-expanded={isOpen}
        data-drawer-toggle
        icon={<ChatsCircleIcon weight="bold" />}
        indicator={showChatBullet && <HeaderButtonBullet />}
      />
    </div>
  );
};
