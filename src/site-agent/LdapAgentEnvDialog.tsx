import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
  const { closeDialog } = useModal();
  const [waldurUrl, setWaldurUrl] = useState('');
  const [waldurToken, setWaldurToken] = useState('CHANGEME');
  const [verifyTls, setVerifyTls] = useState(true);
  const [uidNumber, setUidNumber] = useState('1000');
  const [pgroup, setPgroup] = useState('10000');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [generatedEnv, setGeneratedEnv] = useState<string | null>(null);

  const handleGenerate = () => {
    setGeneratedEnv(
      buildEnvContent({
        waldurUrl,
        waldurToken,
        offeringUuid: offering.uuid,
        verifyTls,
        uidNumber,
        pgroup,
        username,
        password,
        email,
      }),
    );
  };

  if (generatedEnv) {
    return (
      <LdapAgentEnvPreview
        config={generatedEnv}
        onBack={() => setGeneratedEnv(null)}
        onClose={() => closeDialog()}
      />
    );
  }

  return (
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
              !username || !password || !email
                ? translate(
                    'Fill in all required LDAP admin fields to generate.',
                  )
                : null
            }
          >
            <SubmitButton
              submitting={false}
              label={translate('Generate')}
              type="button"
              onClick={handleGenerate}
              disabled={!username || !password || !email}
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
        <h6 className="fw-bold mb-3">{translate('Waldur Connection')}</h6>

        <Form.Group className="mb-3">
          <Form.Label>{translate('API URL (optional)')}</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://waldur.example.com/api/"
            value={waldurUrl}
            onChange={(e) => setWaldurUrl(e.target.value)}
          />
          <Form.Text className="text-muted">
            {translate('Leave empty to use the current server URL.')}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{translate('API Token')}</Form.Label>
          <Form.Control
            type="text"
            value={waldurToken}
            onChange={(e) => setWaldurToken(e.target.value)}
          />
          <Form.Text className="text-muted">
            {translate(
              'Use a long-lived or non-expiring token. You can create one in your user profile under API tokens.',
            )}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{translate('Offering UUID')}</Form.Label>
          <Form.Control type="text" value={offering.uuid} readOnly plaintext />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="ldap-verify-tls"
            label={translate('Verify TLS')}
            checked={verifyTls}
            onChange={(e) => setVerifyTls(e.target.checked)}
          />
        </Form.Group>
      </div>

      {/* LDAP admin credentials */}
      <div>
        <h6 className="fw-bold mb-3">{translate('LDAP Admin Credentials')}</h6>

        <Form.Group className="mb-3">
          <Form.Label>{translate('UID Number')}</Form.Label>
          <Form.Control
            type="number"
            value={uidNumber}
            onChange={(e) => setUidNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{translate('Primary Group')}</Form.Label>
          <Form.Control
            type="number"
            value={pgroup}
            onChange={(e) => setPgroup(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {translate('Username')} <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {translate('Password')} <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {translate('Email')} <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
      </div>
    </ModalDialog>
  );
};
