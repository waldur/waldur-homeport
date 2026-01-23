// Re-export SDK types for data access tracking
export type {
  UserDataAccess as DataAccessVisibility,
  UserDataAccessLog as DataAccessHistoryEntry,
  AdministrativeAccess,
  ServiceProviderAccess,
  DataAccessSummary,
  AccessTypeEnum as AccessType,
  AccessorTypeEnum as AccessorType,
} from 'waldur-js-client';
