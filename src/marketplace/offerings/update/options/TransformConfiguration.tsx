import { SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { MAX_TRANSFORM_AFFIX_LENGTH } from '@/marketplace/common/optionTransform';

const getCaseChoices = () => [
  { value: 'lower', label: translate('Lower case') },
  { value: 'upper', label: translate('Upper case') },
];

export const TransformConfiguration = () => (
  <>
    <StringGroup
      label={translate('Prefix')}
      name="transform.prefix"
      maxLength={MAX_TRANSFORM_AFFIX_LENGTH}
      description={translate(
        'Added before the value when it is saved. A value that already starts with it does not get it twice.',
      )}
    />
    <StringGroup
      label={translate('Suffix')}
      name="transform.suffix"
      maxLength={MAX_TRANSFORM_AFFIX_LENGTH}
      description={translate('Added after the value when it is saved.')}
    />
    <SelectGroup
      label={translate('Change case')}
      name="transform.case"
      options={getCaseChoices()}
      simpleValue
      isClearable
      description={translate(
        'Converts what the user types; the prefix and suffix are kept as written. The validation pattern is checked before the prefix and suffix are added.',
      )}
    />
  </>
);
