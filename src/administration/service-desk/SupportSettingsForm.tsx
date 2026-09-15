import { SettingsDescription } from '@/SettingsDescription';

import { AtlassianSettingsSections } from './AtlassianSettingsSections';
import { SettingField } from './SettingField';

export const getProviderSettings = (name: string) =>
  SettingsDescription.find((group) =>
    group.description.toLowerCase().includes(name),
  )?.items || [];

export const SupportSettingsForm = ({ name }) => {
  const fields = getProviderSettings(name);

  if (name === 'atlassian') {
    return <AtlassianSettingsSections fields={fields} />;
  }

  return (
    <>
      {fields.map((field) => (
        <SettingField key={field.key} field={field} />
      ))}
    </>
  );
};
