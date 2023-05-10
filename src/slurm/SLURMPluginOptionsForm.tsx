import { useMemo, FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, formValueSelector } from 'redux-form';

import {
  FormContainer,
  SelectField,
  NumberField,
  StringField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { RootState } from '@waldur/store/reducers';

const pluginOptionsSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, 'plugin_options');

export const SLURMPluginOptionsForm: FunctionComponent<{ container }> = ({
  container,
}) => {
  const USERNAME_GENERATION_POLICY_OPTIONS = useMemo(
    () => [
      {
        label: translate('Service provider'),
        value: 'service_provider',
      },
      {
        label: translate('Anonymized'),
        value: 'anonymized',
      },
      {
        label: translate('Full name'),
        value: 'full_name',
      },
      {
        label: translate('Waldur username'),
        value: 'waldur_username',
      },
      {
        label: translate('FreeIPA'),
        value: 'freeipa',
      },
    ],
    [],
  );

  const pluginOptions = useSelector(pluginOptionsSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!pluginOptions?.username_generation_policy) {
      dispatch(
        change(
          FORM_ID,
          'plugin_options.username_generation_policy',
          'service_provider',
        ),
      );
    }
    dispatch(change(FORM_ID, 'plugin_options.initial_uidnumber', 100000));
    dispatch(
      change(FORM_ID, 'plugin_options.initial_primarygroup_number', 100000),
    );
  }, []);

  useEffect(() => {
    if (
      pluginOptions?.username_generation_policy === 'anonymized' &&
      !pluginOptions?.username_anonymized_prefix
    ) {
      dispatch(
        change(
          FORM_ID,
          'plugin_options.username_anonymized_prefix',
          'walduruser_',
        ),
      );
    }
  }, [
    dispatch,
    pluginOptions?.username_generation_policy,
    pluginOptions?.username_anonymized_prefix,
  ]);

  return (
    <FormContainer {...container}>
      <SelectField
        name="username_generation_policy"
        label={translate('Username generation policy')}
        options={USERNAME_GENERATION_POLICY_OPTIONS}
        simpleValue={true}
        required={true}
        isClearable={false}
      />
      {pluginOptions &&
        pluginOptions.username_generation_policy == 'anonymized' && (
          <StringField
            name="username_anonymized_prefix"
            label={translate('Username anonymized prefix')}
          />
        )}
      {pluginOptions &&
        pluginOptions.username_generation_policy === 'service_provider' && (
          <div className="alert alert-warning" role="alert">
            {translate(
              'Warning: Service provider option will clear all usernames of the existing offering users',
            )}
          </div>
        )}
      <NumberField
        name="initial_uidnumber"
        label={translate('Initial UID number')}
      />
      <NumberField
        name="initial_primarygroup_number"
        label={translate('Initial primary group number')}
      />
    </FormContainer>
  );
};
