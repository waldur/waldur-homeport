// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in packages/api-client/src/requestHelpers.ts.
// Root pins an exact prerelease/dev-linked build; declaring a second copy
// here would drift out of sync with it.
import { configurationRetrieve } from 'waldur-js-client';

export interface LanguageChoice {
  code: string;
  label: string;
}

const parseLanguages = (inputValue: [string, string][]): LanguageChoice[] => {
  const languageLabels = inputValue.reduce(
    (result, [code, label]) => ({
      ...result,
      [code]: label,
    }),
    {} as Record<string, string>,
  );
  return inputValue
    .map((language) => language[0])
    .map((code) => ({
      code,
      label: languageLabels[code],
    }));
};

export interface RuntimeConfigData {
  /** Per-plugin settings (WALDUR_CORE, WALDUR_RANCHER, etc.) — shape is
   * backend-defined, cast to the host app's own plugin-config type. */
  plugins: Record<string, any>;
  languageChoices: LanguageChoice[];
  defaultLanguage: string;
  FEATURES: Record<string, Record<string, boolean>>;
}

/**
 * Fetches the backend's public configuration (branding, feature flags,
 * language choices, plugin settings). Pure data loading — does not touch
 * the DOM or mutate any config singleton; the caller decides where the
 * result is stored.
 */
export async function fetchRuntimeConfig(): Promise<RuntimeConfigData> {
  const { LANGUAGES, LANGUAGE_CODE, FEATURES, ...plugins } = (
    await configurationRetrieve({ auth: null, parseAs: 'json' })
  ).data as any;
  return {
    plugins,
    languageChoices: parseLanguages(LANGUAGES),
    defaultLanguage: LANGUAGE_CODE,
    FEATURES,
  };
}
