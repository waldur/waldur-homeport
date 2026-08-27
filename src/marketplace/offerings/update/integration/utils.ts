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
 * The backend gates reading them on the permission to change them, held on the
 * offering, its organization, or that organization's service provider — so a
 * user who may open the offering-update page at all can still get a payload
 * with no `secret_options` key. Rather than restate that rule here, take the
 * response as the answer: the field is dropped from the serializer exactly
 * when the user may not see it.
 *
 * Everything reading a `secret_options.*` path must handle its absence:
 * controls bound to one must be read-only, or a save silently overwrites a
 * value the user was never shown, and a direct read must be optional, or the
 * whole section throws while rendering.
 */
export const canSeeOfferingSecretOptions = (
  offering: ProviderOfferingDetails,
): boolean => offering.secret_options !== undefined;

/** Why a control bound to `secret_options` is read-only for this user. */
export const SECRET_OPTIONS_HIDDEN_REASON = translate(
  "Only users who can manage this offering's integration settings can view or change it.",
);

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
