import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { MAX_PATTERN_LENGTH } from '@/marketplace/common/optionPattern';

export const PatternConfiguration = () => (
  <>
    <StringGroup
      label={translate('Validation pattern')}
      name="pattern"
      maxLength={MAX_PATTERN_LENGTH}
      description={translate(
        'Regular expression the whole value must match, for example [a-z][a-z0-9-]+. Use syntax common to Python and JavaScript.',
      )}
    />
    <StringGroup
      label={translate('Validation error message')}
      name="pattern_error"
      maxLength={255}
      description={translate(
        'Shown when the value does not match the pattern. Leave empty to show the pattern itself.',
      )}
    />
  </>
);
