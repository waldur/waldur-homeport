import { FC } from 'react';
import { useField } from 'react-final-form';

import { BooleanGroup, NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { K8sFormSection } from '@/marketplace/common/K8sFormSection';
import {
  SECRET_DEFAULT_MAX_LENGTH,
  SECRET_DEFAULT_MIN_LENGTH,
  SECRET_MAX_LENGTH_CAP,
} from '@/marketplace/common/secretOptions';

const NAME = 'default_configs';

const parseInteger = (value) =>
  value === '' || value === null || value === undefined
    ? undefined
    : parseInt(value, 10);

const getSourceOptions = () => [
  {
    value: 'customer',
    label: translate('The customer enters it'),
  },
  {
    value: 'provider',
    label: translate('The provider or its site agent sets it'),
  },
];

/**
 * Settings of a secret option: who sets the value, whether customers may
 * read it back, its length and whether it spans lines. A secret has no
 * default value.
 */
export const SecretOptionConfiguration: FC = () => {
  const {
    input: { value: source },
  } = useField<string>(`${NAME}.secret_source`, {
    subscription: { value: true },
  });
  const providerSets = source === 'provider';
  return (
    <K8sFormSection
      title={translate('Secret')}
      subtitle={translate(
        'Stored encrypted and never shown with the other settings: customers and you see only whether it is set, and reveal it where allowed.',
      )}
    >
      <SelectGroup
        space={4}
        name={`${NAME}.secret_source`}
        label={translate('Who sets it')}
        description={
          providerSets
            ? translate(
                'Customers do not type it; you or your site agent set it on the resource.',
              )
            : translate(
                'Customers type it when ordering, and can replace it on the resource.',
              )
        }
        options={getSourceOptions()}
        placeholder={getSourceOptions()[0].label}
        isClearable={false}
        simpleValue
      />
      <BooleanGroup
        name={`${NAME}.customer_can_reveal`}
        label={translate('Customers may reveal it')}
        description={translate(
          'On: users who may reveal the resource’s API keys can read the value back. Off: customers see only whether it is set. It starts on for a secret you set and off for one the customer enters.',
        )}
        // Unset, the box shows what the server does by default.
        format={(value) => (value === undefined ? providerSets : value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <NumberGroup
          space={4}
          name={`${NAME}.min_length`}
          label={translate('Shortest length')}
          placeholder={String(SECRET_DEFAULT_MIN_LENGTH)}
          type="number"
          min="1"
          parse={parseInteger}
        />
        <NumberGroup
          space={4}
          name={`${NAME}.max_length`}
          label={translate('Longest length')}
          description={translate('Up to {count} characters.', {
            count: SECRET_MAX_LENGTH_CAP,
          })}
          placeholder={String(SECRET_DEFAULT_MAX_LENGTH)}
          type="number"
          min="1"
          max={String(SECRET_MAX_LENGTH_CAP)}
          parse={parseInteger}
          // Its check also fails on a shortest length typed above it, which
          // leaves this field untouched.
          forceTouched
        />
      </div>
      <BooleanGroup
        name={`${NAME}.multiline`}
        label={translate('Several lines')}
        description={translate(
          'For a PEM key or a kubeconfig: customers get a text area, and line breaks are allowed.',
        )}
      />
    </K8sFormSection>
  );
};
