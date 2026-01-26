import type {
  DiscoverMetadataResponse,
  IdentityProvider,
  WaldurFieldSuggestion,
} from 'waldur-js-client';

export interface FieldMappingChoice {
  waldurField: string;
  selectedClaim: string | null;
  isCustom: boolean;
  customClaim?: string;
}

/**
 * Form values for OIDC Discovery wizard.
 * All wizard state is stored in Final Form values.
 */
export interface OidcFormValues {
  // Step 1: Connection
  discovery_url: string;
  verify_ssl: boolean;
  client_id: string;
  client_secret: string;

  // Step 2: Discovery (populated by DiscoveryStep)
  discoveryResult: DiscoverMetadataResponse | null;
  manualClaims: string[];

  // Step 3: Mapping
  fieldMappings: FieldMappingChoice[];

  // Step 4 & 5: Configuration
  label: string;
  management_url: string;
  protected_fields: string;
  extra_scope: string;
  user_field: string;
  user_claim: string;
  allowed_redirects: string[];
  enable_pkce: boolean;
  enable_post_logout_redirect: boolean;
  is_active: boolean;
}

export interface OidcDiscoveryDialogResolve {
  provider?: IdentityProvider;
  type: string;
  refetch: () => void;
}

// Re-export for convenience
export type { WaldurFieldSuggestion };
