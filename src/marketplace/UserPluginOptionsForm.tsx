import { useMemo, FunctionComponent, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField, NumberField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { EDIT_INTEGRATION_FORM_ID } from './offerings/update/integration/constants';
import { canCreateUserSelector } from './UserSecretOptionsForm';

export const pluginOptionsSelector = (state: RootState) =>
  formValueSelector(EDIT_INTEGRATION_FORM_ID)(state, 'plugin_options');

export const UserPluginOptionsForm: FunctionComponent<{}> = () => {
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
  const canCreateUser = useSelector(canCreateUserSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    if (pluginOptions?.username_generation_policy === undefined) {
      dispatch(
        change(
          EDIT_INTEGRATION_FORM_ID,
          'plugin_options.username_generation_policy',
          'service_provider',
        ),
      );
      dispatch(
        change(
          EDIT_INTEGRATION_FORM_ID,
          'plugin_options.initial_uidnumber',
          100000,
        ),
      );
      dispatch(
        change(
          EDIT_INTEGRATION_FORM_ID,
          'plugin_options.initial_primarygroup_number',
          100000,
        ),
      );
      dispatch(
        change(
          EDIT_INTEGRATION_FORM_ID,
          'plugin_options.homedir_prefix',
          '/home/',
        ),
      );
    }
  }, [dispatch, pluginOptions?.username_generation_policy]);

  useEffect(() => {
    if (
      pluginOptions?.username_generation_policy === 'anonymized' &&
      pluginOptions?.username_anonymized_prefix === undefined
    ) {
      dispatch(
        change(
          EDIT_INTEGRATION_FORM_ID,
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

  return canCreateUser ? (
    <>
      <Form.Label className="mt-3">
        {translate('Username generation policy')}
      </Form.Label>
      <Field
        name="username_generation_policy"
        component={SelectField}
        options={USERNAME_GENERATION_POLICY_OPTIONS}
        simpleValue={true}
        validate={required}
        isClearable={false}
      />

      {pluginOptions &&
        pluginOptions.username_generation_policy == 'anonymized' && (
          <>
            <Form.Label className="mt-3">
              {translate('Username anonymized prefix')}
            </Form.Label>
            <Field name="username_anonymized_prefix" component={StringField} />
          </>
        )}

      {pluginOptions &&
        pluginOptions.username_generation_policy === 'service_provider' && (
          <div className="alert alert-warning mt-3" role="alert">
            {translate(
              'Warning: Service provider option will clear all usernames of the existing offering users',
            )}
          </div>
        )}

      <Form.Label className="mt-3">
        {translate('Initial UID number')}
      </Form.Label>
      <Field name="initial_uidnumber" component={NumberField} />

      <Form.Label className="mt-3">
        {translate('Initial primary group number')}
      </Form.Label>
      <Field name="initial_primarygroup_number" component={NumberField} />

      <Form.Label className="mt-3">
        {translate('Home directory prefix')}
      </Form.Label>
      <Field name="homedir_prefix" component={StringField} />
    </>
  ) : null;
};
