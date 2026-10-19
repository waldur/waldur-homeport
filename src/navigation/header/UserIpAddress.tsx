import { CopyIcon } from '@phosphor-icons/react';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

/**
 * The user's IP address with a copy icon: a menu item, so arrow keys reach
 * it. Choosing the row copies the address; the icon is its look only. The
 * menu stays open.
 */
export const UserIpAddress = ({ ip }: { ip: string }) => {
  const { showSuccess } = useNotify();

  return (
    <Menu.CopyItem
      value={ip}
      onCopied={() =>
        showSuccess(
          translate('{name} has been copied', {
            name: translate('IP address'),
          }),
        )
      }
    >
      <div className="flex grow items-center me-[0.5rem] whitespace-nowrap">
        <div className="grow">
          <span className="block mb-[0.5rem]">{translate('IP address')}:</span>
          <div className="flex justify-between text-quaternary">
            <span>{ip}</span>
            <span className="text-btn" aria-hidden="true">
              <CopyIcon weight="bold" size={20} />
            </span>
          </div>
        </div>
      </div>
    </Menu.CopyItem>
  );
};
