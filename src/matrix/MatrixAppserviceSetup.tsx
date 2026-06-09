import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import {
  adminMatrixAppserviceSetup,
  adminMatrixAppserviceStatusRetrieve,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { SecretGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

type Step = 'loading' | 'error' | 'prereqs' | 'main' | 'result';

export const MatrixAppserviceSetupDialog: FC = () => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{
    registration_yaml: string;
    webhook_url: string;
  } | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [initialStep, setInitialStep] = useState<Step | null>(null);

  const statusQuery = useQuery({
    queryKey: ['matrixAppserviceStatus'],
    queryFn: () => adminMatrixAppserviceStatusRetrieve().then((r) => r.data),
  });
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
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRetry}
                  >
                    {translate('Retry')}
                  </button>
                )}
                {step === 'prereqs' && (
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Next')}
                  />
                )}
                {step === 'main' && (
                  <Tip
                    id="setup-appservice-warning"
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
                  </Tip>
                )}
              </>
            }
          >
            {step === 'loading' && <LoadingSpinner />}

            {step === 'error' && (
              <div className="alert alert-danger mb-0">
                {translate(
                  'Failed to load Matrix appservice configuration. Check your connection and try again.',
                )}
              </div>
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
                      'Shared secret configured in your homeserver for user registration.',
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
                  <div className="alert alert-warning mb-4">
                    {translate(
                      'AS and HS tokens are already configured. Running setup again will generate new tokens and overwrite the existing ones. You will need to update your homeserver configuration with the new registration YAML.',
                    )}
                  </div>
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
                    'Copy this YAML to your Matrix homeserver appservice configuration and restart the homeserver.',
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
