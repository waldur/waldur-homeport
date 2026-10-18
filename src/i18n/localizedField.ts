/**
 * The name of a translated field's column for one language, as the backend
 * (django-modeltranslation) builds it: `description_et`, and
 * `description_en_gb` for the regional code `en-gb`.
 */
export const getLocalizedFieldName = (field: string, languageCode: string) =>
  `${field}_${languageCode.replace(/-/g, '_')}`;
