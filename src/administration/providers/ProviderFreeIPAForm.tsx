import { SETTINGS_FREEIPA_GROUP_NAME } from '@/auth/providers/constants';
import { BooleanGroup, SecretGroup, StringGroup } from '@/form';
import { SettingsDescription } from '@/SettingsDescription';

import { getKeyTitle } from '../settings/utils';

export const ProviderFreeIPAForm = () => (
  <>
    {(
      SettingsDescription.find((group) =>
        group.description.includes(SETTINGS_FREEIPA_GROUP_NAME),
      )?.items || []
    ).map((item) =>
      item.type === 'boolean' ? (
        <BooleanGroup
          key={item.key}
          name={item.key}
          label={getKeyTitle(item.key)}
          help={item.description}
        />
      ) : item.type === 'secret_field' ? (
        <SecretGroup
          key={item.key}
          name={item.key}
          label={getKeyTitle(item.key)}
          help={item.description}
        />
      ) : (
        <StringGroup
          key={item.key}
          name={item.key}
          label={getKeyTitle(item.key)}
          help={item.description}
        />
      ),
    )}
  </>
);
