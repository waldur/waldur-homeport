interface SAML2AuthConfiguration {
  ENABLE_SINGLE_LOGOUT: boolean;
  ALLOW_TO_SELECT_IDENTITY_PROVIDER: boolean;
  IDENTITY_PROVIDER_URL: string;
  IDENTITY_PROVIDER_LABEL: string;
  DISCOVERY_SERVICE_URL: string;
  DISCOVERY_SERVICE_LABEL: string;
  base_url: string;
}

interface SocialAuthConfiguration {
  FACEBOOK_CLIENT_ID: string;
  SMARTIDEE_CLIENT_ID: string;
  TARA_CLIENT_ID: string;
  TARA_SANDBOX: string;
  TARA_LABEL: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_LABEL: string;
  KEYCLOAK_AUTH_URL: string;
  EDUTEAMS_CLIENT_ID: string;
  EDUTEAMS_LABEL: string;
  EDUTEAMS_AUTH_URL: string;
}

interface ValimoAuthConfiguration {
  LABEL: string;
  MOBILE_PREFIX: string;
}

interface CoreConfiguration {
  AUTHENTICATION_METHODS: string[];
  INVITATIONS_ENABLED: boolean;
  ALLOW_SIGNUP_WITHOUT_INVITATION: boolean;
  VALIDATE_INVITATION_EMAIL: boolean;
  OWNER_CAN_MANAGE_CUSTOMER: boolean;
  OWNERS_CAN_MANAGE_OWNERS: boolean;
  COMPANY_TYPES: string[];
  NATIVE_NAME_ENABLED: boolean;
  ONLY_STAFF_MANAGES_SERVICES: boolean;
  PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS: string[];
}

interface MarketplaceConfiguration {
  OWNER_CAN_APPROVE_ORDER: boolean;
  MANAGER_CAN_APPROVE_ORDER: boolean;
  ADMIN_CAN_APPROVE_ORDER: boolean;
  OWNER_CAN_REGISTER_SERVICE_PROVIDER: boolean;
  ANONYMOUS_USER_CAN_VIEW_OFFERINGS: boolean;
}

interface OpenStackConfiguration {
  MANAGER_CAN_MANAGE_TENANTS: boolean;
  TENANT_CREDENTIALS_VISIBLE: boolean;
}

interface OpenStackTenantConfiguration {
  ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS: boolean;
  REQUIRE_AVAILABILITY_ZONE: boolean;
}

interface MarketplaceOpenStackTenantConfiguration {
  TENANT_CATEGORY_UUID: string;
  INSTANCE_CATEGORY_UUID: string;
  VOLUME_CATEGORY_UUID: string;
}

interface RancherConfiguration {
  ROLE_REQUIREMENT: Record<string, { CPU: number; RAM: number }>;
  MOUNT_POINT_CHOICES: string[];
  MOUNT_POINT_MIN_SIZE: number;
  SYSTEM_VOLUME_MIN_SIZE: number;
  READ_ONLY_MODE: boolean;
  MOUNT_POINT_CHOICE_IS_MANDATORY: boolean;
  DISABLE_SSH_KEY_INJECTION: boolean;
  DISABLE_DATA_VOLUME_CREATION: boolean;
}

interface VMWareConfiguration {
  BASIC_MODE: boolean;
}

export interface PluginConfiguration {
  WALDUR_AUTH_SAML2: Partial<SAML2AuthConfiguration>;
  WALDUR_AUTH_SOCIAL: Partial<SocialAuthConfiguration>;
  WALDUR_AUTH_VALIMO: Partial<ValimoAuthConfiguration>;
  WALDUR_CORE: CoreConfiguration;
  WALDUR_MARKETPLACE: MarketplaceConfiguration;
  WALDUR_OPENSTACK: Partial<OpenStackConfiguration>;
  WALDUR_OPENSTACK_TENANT: Partial<OpenStackTenantConfiguration>;
  WALDUR_MARKETPLACE_OPENSTACK: Partial<MarketplaceOpenStackTenantConfiguration>;
  WALDUR_RANCHER: RancherConfiguration;
  WALDUR_VMWARE: Partial<VMWareConfiguration>;
}
