import { merge } from 'lodash-es';
import {
  marketplaceProviderOfferingsUpdateBackendIdRules,
  marketplaceProviderOfferingsUpdateIntegration,
  OfferingIntegrationUpdateRequest,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  getPluginOptionsSerializer,
  getSecretOptionsSerializer,
} from '@/marketplace/common/registry';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const SCRIPT_ROWS = [
  { label: translate('Script language'), type: 'language' },
  {
    label: translate('Script for creation of a resource'),
    type: 'create',
    dry_run: 'Create',
  },
  {
    label: translate('Script for termination of a resource'),
    type: 'terminate',
    dry_run: 'Terminate',
  },
  {
    label: translate('Script for updating a resource on plan or limit change'),
    type: 'update',
    dry_run: 'Update',
  },
  {
    label: translate(
      'Script for regular update of resource and its accounting',
    ),
    type: 'pull',
    dry_run: 'Pull',
  },
];

/**
 * Whether the current user may see this offering's secret options.
 *
 * The backend gates reading them on owner or service-manager access to the
 * provider organization, while the integration PATCH itself is permitted at
 * offering scope too — so a user can hold the write permission and still get a
 * payload with no `secret_options` key at all. Rather than restate that rule
 * here, take the response as the answer: the field is dropped from the
 * serializer exactly when the user may not see it.
 *
 * Controls bound to a `secret_options.*` path must be read-only when this is
 * false; otherwise they render as empty and a save silently overwrites a value
 * the user was never shown.
 */
export const canSeeOfferingSecretOptions = (
  offering: ProviderOfferingDetails,
): boolean => offering.secret_options !== undefined;

export const useUpdateOfferingIntegration = (
  offering: ProviderOfferingDetails,
  refetch?,
) => {
  const { mutateAsync: update } = useManagedMutation<
    any,
    any,
    OfferingIntegrationUpdateRequest
  >({
    mutationFn: async (formData) => {
      if (formData.plugin_options) {
        const serializer = getPluginOptionsSerializer(offering.type);
        if (serializer) {
          formData.plugin_options = serializer(formData.plugin_options);
        }
      }
      if (formData.secret_options) {
        const serializer = getSecretOptionsSerializer(offering.type);
        if (serializer) {
          formData.secret_options = serializer(formData.secret_options);
        }
      }
      return await marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: offering.uuid },
        body: formData,
      });
    },
    successMessage: translate('Offering has been updated successfully.'),
    errorMessage: translate('Unable to update offering.'),
    refetch,
  });

  return { update };
};

export const useUpdateOfferingBackendIdRules = (
  offering: ProviderOfferingDetails,
  refetch?,
) => {
  const { mutateAsync: update } = useManagedMutation<any, any, any>({
    // The update_backend_id_rules action replaces the whole backend_id_rules
    // JSON blob, but each inline EditField submits only its own path. Deep-merge
    // the partial change into the offering's current rules so sibling keys (e.g.
    // format.regex vs uniqueness.scope) are preserved.
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateBackendIdRules({
        path: { uuid: offering.uuid },
        body: {
          backend_id_rules: merge(
            {},
            offering.backend_id_rules ?? {},
            formData.backend_id_rules ?? {},
          ),
        },
      }),
    successMessage: translate('Backend ID rules have been updated.'),
    errorMessage: translate('Unable to update backend ID rules.'),
    refetch,
  });

  return { update };
};
