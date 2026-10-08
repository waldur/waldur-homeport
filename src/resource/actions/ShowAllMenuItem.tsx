import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';

/**
 * The "Show all" row at the foot of a collapsed actions menu: it opens a
 * dialog with every action instead of acting on the resource.
 *
 * It is a `Menu.Item`, not a button placed beside the items. A menu moves
 * focus between its items with the arrow keys, so anything that is not an
 * item is skipped, and a keyboard-only user could never open the dialog.
 * As an item, `onSelect` also closes the menu before the dialog opens.
 * Centred and styled like the secondary text button to set it apart from
 * the action rows above it.
 */
export const ShowAllMenuItem = ({ onSelect }: { onSelect: () => void }) => (
  <>
    <Menu.Separator />
    <Menu.Item
      onSelect={onSelect}
      className="mx-1 my-1 justify-center rounded-md text-center text-[var(--btn-text-secondary-color)]"
    >
      {translate('Show all')}
    </Menu.Item>
  </>
);
