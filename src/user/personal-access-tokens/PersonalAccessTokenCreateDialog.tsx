import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  PatTemplate,
  PatTemplateTarget,
  personalAccessTokensAvailableBindingTargetsList,
  personalAccessTokensAvailableScopesList,
  personalAccessTokensAgentUser,
  personalAccessTokensCreate,
  personalAccessTokensTemplatesList,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';
import { Wizard } from 'waldur-wizard';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import {
  buildSiteAgentTokenConfig,
  getAbsoluteApiUrl,
} from '@/site-agent/siteAgentTokenConfig';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { getScopeGroups } from './scopeOptions';
import {
  buildAgentUserPayload,
  buildTokenPayload,
  getTokenFor,
  CUSTOM_PURPOSE,
  getDefaultExpiry,
  getTokenWizardSteps,
  SITE_AGENT_TEMPLATE,
  TokenWizardValues,
  validateTokenWizard,
} from './wizard/tokenPayload';
import {
  describeBinding,
  TokenWizardData,
  TokenWizardStep,
} from './wizard/TokenWizardSteps';

const PersonalAccessTokenSecretDialog = lazyComponent(() =>
  import('./PersonalAccessTokenSecretDialog').then((module) => ({
    default: module.PersonalAccessTokenSecretDialog,
  })),
);

export interface PersonalAccessTokenPreset {
  /** The template, such as the site agent's. */
  template: string;
  /** The entity the token is bound to. */
  target: PatTemplateTarget;
  /** The offering the token is created from, for the agent configuration. */
  offering?: { uuid: string; name: string };
}

interface PersonalAccessTokenCreateDialogProps {
  resolve: {
    refetch?: () => void;
    /** Purpose and target already chosen: the wizard starts at Permissions. */
    preset?: PersonalAccessTokenPreset;
  };
}

const STEP_FORMS = Array(5).fill(TokenWizardStep);

/** The offering a site agent's configuration names: a site-agent token is
 * always bound to one offering. */
const getAgentOffering = (
  target: PatTemplateTarget,
  preset?: PersonalAccessTokenPreset,
) => {
  if (preset?.offering) return preset.offering;
  // Offerings are addressed by their plain UUID elsewhere in Waldur.
  return { uuid: target.uuid.replace(/-/g, ''), name: target.name };
};

export const PersonalAccessTokenCreateDialog: React.FC<
  PersonalAccessTokenCreateDialogProps
> = ({ resolve: { refetch, preset } }) => {
  const { showErrorResponse } = useNotify();
  // Only shows the dedicated-user choice; the backend enforces who may use it.
  const isStaff = !!useUser()?.is_staff;
  const { openDialog, closeDialog } = useModal();

  const templatesQuery = useQuery({
    queryKey: ['personal-access-token-templates'],
    queryFn: () =>
      personalAccessTokensTemplatesList().then((res) => res.data ?? []),
    meta: OWN_ERROR_STATE,
    // A refetch must not swap the templates under a wizard in progress.
    staleTime: Infinity,
  });
  const scopesQuery = useQuery({
    queryKey: ['personal-access-token-available-scopes'],
    queryFn: () =>
      personalAccessTokensAvailableScopesList().then((res) => res.data ?? []),
    enabled: !preset,
    meta: OWN_ERROR_STATE,
    staleTime: Infinity,
  });
  const bindingTargetsQuery = useQuery({
    queryKey: ['personal-access-token-binding-targets'],
    queryFn: () =>
      personalAccessTokensAvailableBindingTargetsList().then(
        (res) => res.data ?? [],
      ),
    enabled: !preset,
    meta: OWN_ERROR_STATE,
    staleTime: Infinity,
  });

  // A template that does not load leaves Custom, which needs nothing else.
  const templates: PatTemplate[] = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  );

  const data: TokenWizardData = useMemo(
    () => ({
      templates,
      scopeGroups: getScopeGroups(
        new Set((scopesQuery.data ?? []).map((s) => s.permission)),
      ),
      bindingTypes: Array.from(
        new Set((bindingTargetsQuery.data ?? []).flatMap((row) => row.types)),
      ),
      isStaff,
      bindingTargets: Object.fromEntries(
        (bindingTargetsQuery.data ?? []).map((row) => [
          row.permission,
          row.types,
        ]),
      ),
    }),
    [templates, scopesQuery.data, bindingTargetsQuery.data, isStaff],
  );

  const steps = useMemo(
    () =>
      getTokenWizardSteps({
        hasTemplates: templates.length > 0,
        preset: !!preset,
      }),
    [templates.length, preset],
  );

  // Computed once, when the wizard first renders: new initial values would
  // reset the form and lose what the user has entered.
  const initialValuesRef = useRef<Partial<TokenWizardValues>>();
  const getInitialValues = (): Partial<TokenWizardValues> => {
    if (initialValuesRef.current) return initialValuesRef.current;
    const presetTemplate = preset
      ? templates.find((t) => t.key === preset.template)
      : undefined;
    const name = presetTemplate
      ? `${presetTemplate.name}: ${preset!.offering?.name ?? preset!.target.name}`
      : '';
    initialValuesRef.current = {
      purpose: presetTemplate
        ? presetTemplate.key
        : templates.length === 0
          ? CUSTOM_PURPOSE
          : undefined,
      target: presetTemplate ? preset!.target : null,
      features: [],
      scopes: [],
      allowed_scopes: [],
      name,
      generatedName: name || undefined,
      expires_at: presetTemplate
        ? getDefaultExpiry(presetTemplate.default_lifetime_days)
        : '',
    };
    return initialValuesRef.current;
  };

  const validate = useCallback(
    (values: TokenWizardValues) =>
      validateTokenWizard(
        values,
        templates,
        data.bindingTargets,
        describeBinding,
      ),
    [templates, data.bindingTargets],
  );

  const handleSubmit = useCallback(
    async (values: TokenWizardValues) => {
      const template = templates.find((t) => t.key === values.purpose);
      try {
        const forAgentUser =
          !!template && getTokenFor(values, template, isStaff) === 'agent_user';
        let created: { token: string; name: string };
        let username: string | undefined;
        if (forAgentUser) {
          const response = await personalAccessTokensAgentUser({
            body: buildAgentUserPayload(values, template!),
          });
          created = response.data;
          username = response.data.username;
        } else {
          const response = await personalAccessTokensCreate({
            body: buildTokenPayload(values, template),
          });
          created = response.data;
        }
        let agentConfig: string | undefined;
        if (template?.key === SITE_AGENT_TEMPLATE) {
          agentConfig = buildSiteAgentTokenConfig({
            token: created.token,
            apiUrl: getAbsoluteApiUrl(),
            // The payload was refused above when there is no target.
            offering: getAgentOffering(values.target!, preset),
          });
        }
        if (refetch) {
          try {
            await refetch();
          } catch {
            // The token exists: its secret must still be shown, once.
          }
        }
        closeDialog();
        openDialog(PersonalAccessTokenSecretDialog, {
          size: 'lg',
          resolve: {
            token: created.token,
            tokenName: created.name,
            agentConfig,
            username,
          },
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to create token.'));
      }
    },
    [
      templates,
      preset,
      isStaff,
      showErrorResponse,
      openDialog,
      closeDialog,
      refetch,
    ],
  );

  const loading =
    templatesQuery.isLoading ||
    (!preset && (scopesQuery.isLoading || bindingTargetsQuery.isLoading));

  // Opened for a template the user cannot use (any more), or one that did
  // not load: there is nothing to preselect, and Custom is not set up here.
  const presetUnavailable =
    !loading && !!preset && !templates.some((t) => t.key === preset.template);

  if (presetUnavailable) {
    return (
      <ModalDialog
        title={translate('Create personal access token')}
        footer={<CloseDialogButton />}
      >
        <AlertItem
          type="floating"
          variant="error"
          title={
            templatesQuery.isError
              ? translate('Unable to load token templates.')
              : translate('You can no longer create this kind of token here.')
          }
          body={translate(
            'Try again later, or create a token with custom permissions from your profile.',
          )}
        />
      </ModalDialog>
    );
  }

  if (loading) {
    return (
      <ModalDialog title={translate('Create personal access token')}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Wizard<TokenWizardValues>
      title={translate('Create personal access token')}
      steps={steps}
      wizardForms={STEP_FORMS}
      onSubmit={handleSubmit}
      submitLabel={translate('Create token')}
      initialValues={getInitialValues()}
      mutators={{ ...arrayMutators }}
      validate={validate}
      data={data}
    />
  );
};
