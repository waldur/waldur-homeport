import { AtlassianSettings } from './AtlassianSettings';
import { SmaxSettings } from './SmaxSettings';
import { ZammadSettings } from './ZammadSettings';

const ProviderSettingForms = {
  atlassian: AtlassianSettings,
  zammad: ZammadSettings,
  smax: SmaxSettings,
};

export const SupportSettingsForm = ({ name }) => {
  const SettingsForm = ProviderSettingForms[name];
  return <SettingsForm />;
};
