import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  identityProvidersCreate,
  identityProvidersUpdate,
  IdentityProviderRequest,
} from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { Wizard } from '@waldur/wizard';

import { ConfigurationStep } from './steps/ConfigurationStep';
import { ConnectionStep } from './steps/ConnectionStep';
import { DiscoveryStep } from './steps/DiscoveryStep';
import { MappingStep } from './steps/MappingStep';
import { PreviewStep } from './steps/PreviewStep';
import type {
  FieldMappingChoice,
  OidcDiscoveryDialogResolve,
  OidcFormValues,
} from './types';

const steps: ProgressStep[] = [
  { key: 'connection', label: translate('Connection'), completed: false },
  { key: 'discovery', label: translate('Discovery'), completed: false },
  { key: 'mapping', label: translate('Mapping'), completed: false },
  { key: 'configuration', label: translate('Configuration'), completed: false },
  { key: 'preview', label: translate('Preview & Save'), completed: false },
];

const wizardForms = [
  ConnectionStep,
  DiscoveryStep,
  MappingStep,
  ConfigurationStep,
  PreviewStep,
];

interface OidcDiscoveryDialogProps {
  resolve: OidcDiscoveryDialogResolve;
}

export const OidcDiscoveryDialog: FC<OidcDiscoveryDialogProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const initialValues = useMemo((): OidcFormValues => {
    const provider = resolve.provider;
    return {
      // Connection
      discovery_url: provider?.discovery_url || '',
      verify_ssl: provider?.verify_ssl ?? true,
      client_id: provider?.client_id || '',
      client_secret: '',
      // Discovery results (populated by DiscoveryStep)
      discoveryResult: null,
      manualClaims: [],
      // Mapping (populated by MappingStep)
      fieldMappings: [],
      // Configuration
      label: provider?.label || '',
      management_url: provider?.management_url || '',
      protected_fields: Array.isArray(provider?.protected_fields)
        ? provider.protected_fields.join(', ')
        : typeof provider?.protected_fields === 'string'
          ? provider.protected_fields
          : '',
      extra_scope: provider?.extra_scope || '',
      user_field: provider?.user_field || 'username',
      user_claim: provider?.user_claim || 'sub',
      allowed_redirects: Array.isArray(provider?.allowed_redirects)
        ? provider.allowed_redirects
        : [],
      enable_pkce: provider?.enable_pkce ?? true,
      enable_post_logout_redirect:
        provider?.enable_post_logout_redirect ?? true,
      is_active: provider?.is_active ?? true,
    };
  }, [resolve.provider]);

  const buildAttributeMapping = (
    fieldMappings: FieldMappingChoice[],
  ): Record<string, string> => {
    const mapping: Record<string, string> = {};
    for (const fm of fieldMappings) {
      const claim = fm.isCustom ? fm.customClaim : fm.selectedClaim;
      if (claim) {
        mapping[fm.waldurField] = claim;
      }
    }
    return mapping;
  };

  const buildProtectedFields = (protectedFields: string): string[] => {
    return protectedFields
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  };

  const onSubmit = useCallback(
    async (values: OidcFormValues) => {
      const providerData: IdentityProviderRequest = {
        provider: resolve.type,
        discovery_url: values.discovery_url,
        client_id: values.client_id,
        client_secret: values.client_secret,
        verify_ssl: values.verify_ssl,
        label: values.label,
        management_url: values.management_url || undefined,
        protected_fields: buildProtectedFields(values.protected_fields),
        extra_scope: values.extra_scope || undefined,
        user_field: values.user_field || undefined,
        user_claim: values.user_claim || undefined,
        allowed_redirects: values.allowed_redirects,
        enable_pkce: values.enable_pkce,
        enable_post_logout_redirect: values.enable_post_logout_redirect,
        is_active: values.is_active,
        attribute_mapping: buildAttributeMapping(values.fieldMappings),
      };

      try {
        if (resolve.provider) {
          await identityProvidersUpdate({
            path: { provider: resolve.type },
            body: providerData,
          });
          dispatch(
            showSuccess(translate('Identity provider updated successfully')),
          );
        } else {
          await identityProvidersCreate({
            body: providerData,
          });
          dispatch(
            showSuccess(translate('Identity provider created successfully')),
          );
        }

        queryClient.invalidateQueries({
          queryKey: ['IdentityProviders'],
        });
        resolve.refetch();
        dispatch(closeModalDialog());
      } catch (e: any) {
        dispatch(
          showErrorResponse(e, translate('Failed to save identity provider')),
        );
        throw e; // Re-throw to keep form in submitting state
      }
    },
    [dispatch, queryClient, resolve],
  );

  const title = resolve.provider
    ? translate('Re-discover OIDC Provider')
    : translate('OIDC Provider Discovery');

  return (
    <Wizard<OidcFormValues>
      onSubmit={onSubmit}
      submitLabel={
        resolve.provider
          ? translate('Update Provider')
          : translate('Create Provider')
      }
      nextLabel={translate('Continue')}
      steps={steps}
      wizardForms={wizardForms}
      title={title}
      subtitle={translate('Configure OIDC identity provider settings')}
      initialValues={initialValues}
      data={{
        existingProvider: resolve.provider,
        providerType: resolve.type,
      }}
    />
  );
};
