import type {
  DiscoverMetadataRequestRequest,
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

export interface OidcDiscoveryState {
  // Step 1: Connection
  connection: DiscoverMetadataRequestRequest | null;
  connectionValid: boolean;
  clientId: string;
  clientSecret: string;

  // Step 2: Discovery
  discoveryResult: DiscoverMetadataResponse | null;
  claimsNotExposed: boolean;
  manualClaims: string[];

  // Step 3: Mapping
  fieldMappings: FieldMappingChoice[];

  // Step 4: Configuration
  configuration: {
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
  };

  // Existing provider (for re-discovery)
  existingProvider?: IdentityProvider;
}

export interface OidcDiscoveryDialogResolve {
  provider?: IdentityProvider;
  type: string;
  refetch: () => void;
}

export interface StepProps {
  state: OidcDiscoveryState;
  updateState: (updates: Partial<OidcDiscoveryState>) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

// Re-export for convenience
export type { WaldurFieldSuggestion };
