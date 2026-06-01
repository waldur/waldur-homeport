import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';

import { Tip } from '@/core/Tooltip';
import { composeValidators, email, required, url } from '@/core/validators';
import {
  BooleanGroup,
  EmailGroup,
  NumberGroup,
  SecretGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { LdapAgentEnvPreview } from './LdapAgentEnvPreview';

interface LdapAgentEnvDialogProps {
  resolve: {
    offering: {
      uuid: string;
      name: string;
    };
  };
}

const buildEnvContent = (values: {
  waldurUrl: string;
  waldurToken: string;
  offeringUuid: string;
  verifyTls: boolean;
  uidNumber: string;
  pgroup: string;
  username: string;
  password: string;
  email: string;
}) => {
  const lines: string[] = [];
  lines.push(
    `WALDUR_URL=${values.waldurUrl || 'https://waldur.example.com/api/'}`,
  );
  lines.push(`WALDUR_TOKEN=${values.waldurToken || 'CHANGEME'}`);
  lines.push(`WALDUR_OFFERING_UUID=${values.offeringUuid}`);
  lines.push(`WALDUR_API_VERIFY_TLS=${values.verifyTls}`);
  lines.push(`LDAP_ADMIN_UIDNUMBER=${values.uidNumber}`);
  lines.push(`LDAP_ADMIN_PGROUP=${values.pgroup}`);
  lines.push(`LDAP_ADMIN_USERNAME=${values.username}`);
  lines.push(`LDAP_ADMIN_PASSWORD=${values.password}`);
  lines.push(`LDAP_ADMIN_EMAIL=${values.email}`);
  lines.push(
    '# Optional advanced STOMP WebSocket settings (defaults shown as comments)',
  );
  lines.push('# WALDUR_STOMP_WS_HOST=');
  lines.push('# WALDUR_STOMP_WS_PORT=443');
  lines.push('# WALDUR_STOMP_WS_PATH=/rmqws-stomp');
  lines.push('# WALDUR_WEBSOCKET_USE_TLS=true');
  return lines.join('\n');
};

export const LdapAgentEnvDialog: FC<LdapAgentEnvDialogProps> = ({
  resolve: { offering },
}) => {
  const [generatedEnv, setGeneratedEnv] = useState<string | null>(null);

  const initialValues = useMemo(
    () => ({
      waldurUrl: '',
      waldurToken: 'CHANGEME',
      offeringUuid: offering.uuid,
      verifyTls: true,
      uidNumber: 1000,
      pgroup: 10000,
      username: '',
      password: '',
      email: '',
    }),
    [offering.uuid],
  );

  const handleGenerate = (values) => {
    setGeneratedEnv(
      buildEnvContent({
        waldurUrl: values.waldurUrl,
        waldurToken: values.waldurToken,
        offeringUuid: offering.uuid,
        verifyTls: values.verifyTls,
        uidNumber: String(values.uidNumber),
        pgroup: String(values.pgroup),
        username: values.username,
        password: values.password,
        email: values.email,
      }),
    );
  };
  return (
    <Form
      onSubmit={handleGenerate}
      initialValues={initialValues}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          {generatedEnv ? (
            <LdapAgentEnvPreview
              config={generatedEnv}
              onBack={() => setGeneratedEnv(null)}
            />
          ) : (
            <ModalDialog
              title={translate('Generate LDAP Agent Environment')}
              subtitle={translate(
                'Generate a .env configuration file for the refresh-glauth-config service.',
              )}
              footer={
                <>
                  <CloseDialogButton />
                  <Tip
                    id="ldap-generate-btn"
                    label={
                      invalid
                        ? translate(
                            'Fill in all required LDAP admin fields to generate.',
                          )
                        : null
                    }
                  >
                    <SubmitButton
                      submitting={false}
                      label={translate('Generate')}
                      type="submit"
                      disabled={invalid}
                    />
                  </Tip>
                </>
              }
            >
              {/* Fixed offering info */}
              <div className="bg-light-primary rounded p-3 mb-4">
                <div className="text-gray-700 small mb-1">
                  {translate('Generating configuration for:')}
                </div>
                <div className="fw-bold">{offering.name}</div>
              </div>

              {/* Waldur connection settings */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  {translate('Waldur Connection')}
                </h6>

                <StringGroup
                  name="waldurUrl"
                  label={translate('API URL (optional)')}
                  placeholder="https://waldur.example.com/api/"
                  description={translate(
                    'Leave empty to use the current server URL.',
                  )}
                  validate={url}
                  type="url"
                />

                <StringGroup
                  name="waldurToken"
                  label={translate('API Token')}
                  description={translate(
                    'Use a long-lived or non-expiring token. You can create one in your user profile under API tokens.',
                  )}
                />

                <StringGroup
                  name="offeringUuid"
                  label={translate('Offering UUID')}
                  readOnly
                  plaintext
                />

                <BooleanGroup
                  name="verifyTls"
                  label={translate('Verify TLS')}
                />
              </div>

              {/* LDAP admin credentials */}
              <div>
                <h6 className="fw-bold mb-3">
                  {translate('LDAP Admin Credentials')}
                </h6>

                <NumberGroup name="uidNumber" label={translate('UID Number')} />

                <NumberGroup name="pgroup" label={translate('Primary Group')} />

                <StringGroup
                  name="username"
                  label={translate('Username')}
                  required
                  validate={required}
                />

                <SecretGroup
                  name="password"
                  label={translate('Password')}
                  required
                  validate={required}
                />

                <EmailGroup
                  name="email"
                  label={translate('Email')}
                  required
                  validate={composeValidators(required, email)}
                />
              </div>
            </ModalDialog>
          )}
        </form>
      )}
    />
  );
};
