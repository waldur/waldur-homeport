import { SETTINGS_FREEIPA_GROUP_NAME } from '@/auth/providers/constants';
import { BooleanGroup, SecretGroup, StringGroup } from '@/form';
import { SettingsDescription } from '@/SettingsDescription';

import { useLockedReasons } from '../settings/useSettingSources';
import { getKeyTitle } from '../settings/utils';

export const ProviderFreeIPAForm = () => {
  const lockedReasons = useLockedReasons();
  return (
    <>
      {(
        SettingsDescription.find((group) =>
          group.description.includes(SETTINGS_FREEIPA_GROUP_NAME),
        )?.items || []
      ).map((item) => {
        const props = {
          name: item.key,
          label: getKeyTitle(item.key),
          help: item.description,
          description: lockedReasons[item.key],
          disabled: Boolean(lockedReasons[item.key]),
        };
        return item.type === 'boolean' ? (
          <BooleanGroup key={item.key} {...props} />
        ) : item.type === 'secret_field' ? (
          <SecretGroup key={item.key} {...props} />
        ) : (
          <StringGroup key={item.key} {...props} />
        );
      })}
    </>
  );
};
