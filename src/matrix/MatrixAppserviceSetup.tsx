import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import {
  adminMatrixAppserviceSetup,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { AlertItem, BaseButton, Tooltip } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SecretGroup, StringGroup, SubmitButton } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { useMatrixAppserviceStatus } from './useMatrixAppserviceStatus';
import { REGISTER_APPSERVICE_COMMAND } from './utils';

type Step = 'loading' | 'error' | 'prereqs' | 'main' | 'result';

export const MatrixAppserviceSetupDialog: FC = () => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{
    registration_yaml: string;
    webhook_url: string;
  } | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [initialStep, setInitialStep] = useState<Step | null>(null);

  const statusQuery = useMatrixAppserviceStatus();
  const statusData = statusQuery.data;

  const settingsQuery = useQuery({
    queryKey: ['MatrixAdminSettings'],
    queryFn: () => overrideSettingsRetrieve().then((r) => r.data),
  });
  const settings = settingsQuery.data;

  const loadError = settingsQuery.error || statusQuery.error;

  const missingPrereqs = {
    homeserver_url: settings ? !settings.MATRIX_HOMESERVER_URL : false,
    homeserver_domain: settings ? !settings.MATRIX_HOMESERVER_DOMAIN : false,
    user_registration_secret: settings
      ? !settings.MATRIX_USER_REGISTRATION_SECRET
      : false,
  };
  const needsPrereqs = Object.values(missingPrereqs).some(Boolean);

  useEffect(() => {
    if (loadError && step === 'loading') {
      setStep('error');
    }
  }, [loadError, step]);

  useEffect(() => {
    if (settings && initialStep === null) {
      const entry: Step = needsPrereqs ? 'prereqs' : 'main';
      setInitialStep(entry);
      setStep(entry);
    }
  }, [settings, needsPrereqs, initialStep]);

  const handleRetry = () => {
    setStep('loading');
    statusQuery.refetch();
    settingsQuery.refetch();
  };

  const tokensConfigured =
    statusData?.as_token_configured || statusData?.hs_token_configured;

  const setupMutation = useManagedMutation<
    { data: any },
    any,
    Record<string, string>
  >({
    mutationFn: (formData) =>
      adminMatrixAppserviceSetup({ body: formData as any }),
    errorMessage: translate('Unable to setup appservice.'),
    // Keep the dialog open on success: this flow advances to the 'result' step
    // to show the registration YAML. The default (closeModal: true) closes the
    // dialog before that step can render, so the YAML is never shown.
    closeModal: false,
    invalidateQueries: [
      { queryKey: ['matrixAppserviceStatus'] },
      { queryKey: ['MatrixAdminSettings'] },
    ],
  });
  // queryClient is still needed by callers that explicitly reset the
  // status query when the dialog re-opens — keep the import live.
  void queryClient;

  const onSubmit = async (formData: Record<string, string>) => {
    if (step === 'prereqs') {
      setStep('main');
      return;
    }
    // Only include keys when the user actually entered a value. Empty
    // strings would trip DRF's CharField blank-rejection; omitting them
    // lets the backend fall back to its Constance defaults (e.g.
    // sender_localpart → "waldur-bot").
    const body: Record<string, string> = {};
    if (formData.url) {
      body.url = formData.url;
    }
    if (formData.sender_localpart) {
      body.sender_localpart = formData.sender_localpart;
    }
    if (missingPrereqs.homeserver_url && formData.homeserver_url) {
      body.homeserver_url = formData.homeserver_url;
    }
    // Optional public URL — not part of missingPrereqs (never blocks setup).
    // The backend only writes it when Constance is empty, mirroring the
    // other "only-write-when-missing" prereqs.
    if (formData.homeserver_public_url) {
      body.homeserver_public_url = formData.homeserver_public_url;
    }
    if (missingPrereqs.homeserver_domain && formData.homeserver_domain) {
      body.homeserver_domain = formData.homeserver_domain;
    }
    if (
      missingPrereqs.user_registration_secret &&
      formData.user_registration_secret
    ) {
      body.user_registration_secret = formData.user_registration_secret;
    }
    try {
      const response = await setupMutation.mutateAsync(body);
      // useManagedMutation can return void (cancellation path); only
      // advance to the result step when a real response landed.
      if (response) {
        setResult(response.data as any);
        setStep('result');
      }
    } catch {
      // Error toast handled by useManagedMutation; keep onSubmit going.
    }
  };

  const showBackButton = step === 'main' && initialStep === 'prereqs';

  return (
    <Form onSubmit={onSubmit} initialValues={{ url: window.location.origin }}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Setup appservice')}
            footer={
              <>
                {showBackButton && (
                  <CloseDialogButton
                    label={translate('Back')}
                    onClick={() => setStep('prereqs')}
                  />
                )}
                <CloseDialogButton />
                {step === 'error' && (
                  <BaseButton
                    variant="primary"
                    onClick={handleRetry}
                    label={translate('Retry')}
                  />
                )}
                {step === 'prereqs' && (
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Next')}
                  />
                )}
                {step === 'main' && (
                  <Tooltip
                    label={
                      tokensConfigured
                        ? translate(
                            'This will overwrite existing AS and HS tokens.',
                          )
                        : undefined
                    }
                  >
                    <SubmitButton
                      submitting={submitting}
                      label={translate('Setup')}
                    />
                  </Tooltip>
                )}
              </>
            }
          >
            {step === 'loading' && <LoadingSpinner />}

            {step === 'error' && (
              <AlertItem
                type="floating"
                variant="error"
                title={translate(
                  'Failed to load Matrix appservice configuration. Check your connection and try again.',
                )}
              />
            )}

            {step === 'prereqs' && (
              <>
                <h5 className="mb-3">{translate('Homeserver')}</h5>
                <p className="mb-4">
                  {translate(
                    'These values are required to generate a working appservice registration. They will be saved to Matrix settings.',
                  )}
                </p>
                {missingPrereqs.homeserver_url && (
                  <StringGroup
                    name="homeserver_url"
                    label={translate('Homeserver URL')}
                    description={translate(
                      'Matrix homeserver base URL, e.g. https://matrix.example.com',
                    )}
                    required
                    validate={required}
                    placeholder="https://matrix.example.com"
                  />
                )}
                {/*
                  Public URL is optional and never gates setup completion.
                  Show it on the prereqs step so operators can configure it
                  in one place; leave blank when the homeserver URL above
                  works from both servers and browsers.
                */}
                <StringGroup
                  name="homeserver_public_url"
                  label={translate('Public homeserver URL')}
                  description={translate(
                    'Optional. Used by browser clients when the homeserver URL above is Docker-internal or otherwise unreachable from the browser.',
                  )}
                  placeholder="https://waldur.example.com"
                />
                {missingPrereqs.homeserver_domain && (
                  <StringGroup
                    name="homeserver_domain"
                    label={translate('Homeserver domain')}
                    description={translate(
                      'Matrix server_name, e.g. matrix.example.com. Used in user IDs and room aliases.',
                    )}
                    required
                    validate={required}
                    placeholder="matrix.example.com"
                  />
                )}
                {missingPrereqs.user_registration_secret && (
                  <SecretGroup
                    name="user_registration_secret"
                    label={translate('Registration secret')}
                    description={translate(
                      "Registration token the homeserver requires for sign-up (its registration_token). With zero-touch setup it is also the homeserver's registration_shared_secret, which can create homeserver admins. Protect it like the appservice tokens.",
                    )}
                    required
                    spaceless
                    validate={required}
                  />
                )}
              </>
            )}

            {step === 'main' && (
              <>
                {tokensConfigured && (
                  <AlertItem
                    type="floating"
                    variant="warning"
                    className="mb-4"
                    title={translate('AS and HS tokens are already configured')}
                    body={
                      <>
                        <p>
                          {translate(
                            'Running Setup again generates new tokens and overwrites the existing ones, and chat stops working until the homeserver has the new registration. {command} replaces the old registration itself. If you register by hand, send {unregister} in the admin room first, then register the new YAML. On Synapse, replace the file and restart the homeserver.',
                            {
                              command: (
                                <code>{REGISTER_APPSERVICE_COMMAND}</code>
                              ),
                              unregister: (
                                <code>
                                  !admin appservices unregister waldur
                                </code>
                              ),
                            },
                            formatJsxTemplate,
                          )}
                        </p>
                        <p className="mb-0">
                          {translate(
                            'If Helm or Docker Compose still set up Matrix on this installation, do not run Setup. It replaces the tokens the deployment supplies, and the next deploy then fails: "Constance holds appservice tokens that were not seeded by the deployment and differ from the supplied ones". Rotate the tokens where the deployment keeps them and redeploy instead.',
                          )}
                        </p>
                      </>
                    }
                  />
                )}
                <StringGroup
                  name="url"
                  label={translate('Waldur URL')}
                  description={translate(
                    'Base URL reachable by the Matrix homeserver for webhook callbacks. The default below is taken from your browser address bar — change it if the homeserver process reaches Waldur via a different hostname (e.g. inside a Kubernetes cluster).',
                  )}
                  placeholder={window.location.origin}
                />
                <StringGroup
                  name="sender_localpart"
                  label={translate('Bot localpart')}
                  description={translate(
                    'Localpart for the appservice bot user (default: waldur-bot).',
                  )}
                  placeholder="waldur-bot"
                />
              </>
            )}

            {step === 'result' && result && (
              <div>
                <h5>{translate('Registration YAML')}</h5>
                <p className="text-muted">
                  {translate(
                    'Register this YAML on the homeserver. On Tuwunel, run {command} with MATRIX_ADMIN_TOKEN set, or with MATRIX_BOOTSTRAP_PASSWORD set and the homeserver\'s registration_shared_secret equal to the registration secret (see "Registering on Tuwunel from the command line" in the admin guide); or send {adminCommand} with the YAML in the admin room. On Synapse, add it to app_service_config_files and restart the homeserver. Do not run Setup again: it generates new tokens.',
                    {
                      command: <code>{REGISTER_APPSERVICE_COMMAND}</code>,
                      adminCommand: <code>!admin appservices register</code>,
                    },
                    formatJsxTemplate,
                  )}
                </p>
                <div className="position-relative">
                  <pre className="bg-light p-4 rounded">
                    {result.registration_yaml}
                  </pre>
                  <div className="position-absolute top-0 end-0 m-2">
                    <CopyToClipboardButton value={result.registration_yaml} />
                  </div>
                </div>
                {result.webhook_url && (
                  <div className="mt-3">
                    <strong>{translate('Webhook URL')}:</strong>{' '}
                    <code>{result.webhook_url}</code>
                  </div>
                )}
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
