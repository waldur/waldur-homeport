// WARNING: This file is auto-generated from src/waldur_core/permissions/print_permission_enums.py
// Do not edit it manually. All manual changes would be overridden.
export const RoleEnum = {
  CUSTOMER_OWNER: 'CUSTOMER.OWNER',
  CUSTOMER_SUPPORT: 'CUSTOMER.SUPPORT',
  CUSTOMER_MANAGER: 'CUSTOMER.MANAGER',
  PROJECT_ADMIN: 'PROJECT.ADMIN',
  PROJECT_MANAGER: 'PROJECT.MANAGER',
  PROJECT_MEMBER: 'PROJECT.MEMBER',
  OFFERING_MANAGER: 'OFFERING.MANAGER',
  CALL_REVIEWER: 'CALL.REVIEWER',
  CALL_MANAGER: 'CALL.MANAGER',
  PROPOSAL_MEMBER: 'PROPOSAL.MEMBER',
  PROPOSAL_MANAGER: 'PROPOSAL.MANAGER',
};

export const PermissionMap = {
  customer: 'CUSTOMER.CREATE_PERMISSION',
  project: 'PROJECT.CREATE_PERMISSION',
  offering: 'OFFERING.CREATE_PERMISSION',
  call: 'CALL.CREATE_PERMISSION',
  proposal: 'PROPOSAL.MANAGE',
};

export const PermissionEnum = {
  REGISTER_SERVICE_PROVIDER: 'SERVICE_PROVIDER.REGISTER',
  CREATE_OFFERING: 'OFFERING.CREATE',
  DELETE_OFFERING: 'OFFERING.DELETE',
  UPDATE_OFFERING_THUMBNAIL: 'OFFERING.UPDATE_THUMBNAIL',
  UPDATE_OFFERING: 'OFFERING.UPDATE',
  UPDATE_OFFERING_ATTRIBUTES: 'OFFERING.UPDATE_ATTRIBUTES',
  UPDATE_OFFERING_LOCATION: 'OFFERING.UPDATE_LOCATION',
  UPDATE_OFFERING_DESCRIPTION: 'OFFERING.UPDATE_DESCRIPTION',
  UPDATE_OFFERING_OPTIONS: 'OFFERING.UPDATE_OPTIONS',
  UPDATE_OFFERING_INTEGRATION: 'OFFERING.UPDATE_INTEGRATION',
  ADD_OFFERING_ENDPOINT: 'OFFERING.ADD_ENDPOINT',
  DELETE_OFFERING_ENDPOINT: 'OFFERING.DELETE_ENDPOINT',
  UPDATE_OFFERING_COMPONENTS: 'OFFERING.UPDATE_COMPONENTS',
  PAUSE_OFFERING: 'OFFERING.PAUSE',
  UNPAUSE_OFFERING: 'OFFERING.UNPAUSE',
  ARCHIVE_OFFERING: 'OFFERING.ARCHIVE',
  DRY_RUN_OFFERING_SCRIPT: 'OFFERING.DRY_RUN_SCRIPT',
  MANAGE_CAMPAIGN: 'OFFERING.MANAGE_CAMPAIGN',
  MANAGE_OFFERING_USER_GROUP: 'OFFERING.MANAGE_USER_GROUP',
  CREATE_OFFERING_PLAN: 'OFFERING.CREATE_PLAN',
  UPDATE_OFFERING_PLAN: 'OFFERING.UPDATE_PLAN',
  ARCHIVE_OFFERING_PLAN: 'OFFERING.ARCHIVE_PLAN',
  CREATE_OFFERING_SCREENSHOT: 'OFFERING.CREATE_SCREENSHOT',
  UPDATE_OFFERING_SCREENSHOT: 'OFFERING.UPDATE_SCREENSHOT',
  DELETE_OFFERING_SCREENSHOT: 'OFFERING.DELETE_SCREENSHOT',
  CREATE_OFFERING_USER: 'OFFERING.CREATE_USER',
  UPDATE_OFFERING_USER: 'OFFERING.UPDATE_USER',
  DELETE_OFFERING_USER: 'OFFERING.DELETE_USER',
  MANAGE_OFFERING_USER_ROLE: 'OFFERING.MANAGE_USER_ROLE',
  CREATE_RESOURCE_ROBOT_ACCOUNT: 'RESOURCE.CREATE_ROBOT_ACCOUNT',
  UPDATE_RESOURCE_ROBOT_ACCOUNT: 'RESOURCE.UPDATE_ROBOT_ACCOUNT',
  DELETE_RESOURCE_ROBOT_ACCOUNT: 'RESOURCE.DELETE_ROBOT_ACCOUNT',
  APPROVE_PRIVATE_ORDER: 'ORDER.APPROVE_PRIVATE',
  APPROVE_ORDER: 'ORDER.APPROVE',
  REJECT_ORDER: 'ORDER.REJECT',
  DESTROY_ORDER: 'ORDER.DESTROY',
  CANCEL_ORDER: 'ORDER.CANCEL',
  TERMINATE_RESOURCE: 'RESOURCE.TERMINATE',
  LIST_IMPORTABLE_RESOURCES: 'RESOURCE.LIST_IMPORTABLE',
  SET_RESOURCE_END_DATE: 'RESOURCE.SET_END_DATE',
  SET_RESOURCE_USAGE: 'RESOURCE.SET_USAGE',
  SWITCH_RESOURCE_PLAN: 'RESOURCE.SET_PLAN',
  UPDATE_RESOURCE_LIMITS: 'RESOURCE.SET_LIMITS',
  SET_RESOURCE_BACKEND_ID: 'RESOURCE.SET_BACKEND_ID',
  SUBMIT_RESOURCE_REPORT: 'RESOURCE.SUBMIT_REPORT',
  SET_RESOURCE_BACKEND_METADATA: 'RESOURCE.SET_BACKEND_METADATA',
  UPDATE_RESOURCE_OPTIONS: 'RESOURCE.UPDATE_OPTIONS',
  ACCEPT_BOOKING_REQUEST: 'RESOURCE.ACCEPT_BOOKING_REQUEST',
  REJECT_BOOKING_REQUEST: 'RESOURCE.REJECT_BOOKING_REQUEST',
  MANAGE_RESOURCE_USERS: 'RESOURCE.MANAGE_USERS',
  CREATE_PROJECT_PERMISSION: 'PROJECT.CREATE_PERMISSION',
  CREATE_CUSTOMER_PERMISSION: 'CUSTOMER.CREATE_PERMISSION',
  CREATE_OFFERING_PERMISSION: 'OFFERING.CREATE_PERMISSION',
  CREATE_CALL_PERMISSION: 'CALL.CREATE_PERMISSION',
  MANAGE_PROPOSAL: 'PROPOSAL.MANAGE',
  UPDATE_PROJECT_PERMISSION: 'PROJECT.UPDATE_PERMISSION',
  UPDATE_CUSTOMER_PERMISSION: 'CUSTOMER.UPDATE_PERMISSION',
  UPDATE_OFFERING_PERMISSION: 'OFFERING.UPDATE_PERMISSION',
  UPDATE_CALL_PERMISSION: 'CALL.UPDATE_PERMISSION',
  UPDATE_PROPOSAL_PERMISSION: 'PROPOSAL.UPDATE_PERMISSION',
  DELETE_PROJECT_PERMISSION: 'PROJECT.DELETE_PERMISSION',
  DELETE_CUSTOMER_PERMISSION: 'CUSTOMER.DELETE_PERMISSION',
  DELETE_OFFERING_PERMISSION: 'OFFERING.DELETE_PERMISSION',
  DELETE_CALL_PERMISSION: 'CALL.DELETE_PERMISSION',
  DELETE_PROPOSAL_PERMISSION: 'PROPOSAL.DELETE_PERMISSION',
  CREATE_LEXIS_LINK: 'LEXIS_LINK.CREATE',
  DELETE_LEXIS_LINK: 'LEXIS_LINK.DELETE',
  CREATE_PROJECT: 'PROJECT.CREATE',
  DELETE_PROJECT: 'PROJECT.DELETE',
  UPDATE_PROJECT: 'PROJECT.UPDATE',
  CREATE_CUSTOMER: 'CUSTOMER.CREATE',
  UPDATE_CUSTOMER: 'CUSTOMER.UPDATE',
  DELETE_CUSTOMER: 'CUSTOMER.DELETE',
  ACCEPT_REQUESTED_OFFERING: 'OFFERING.ACCEPT_CALL_REQUEST',
  APPROVE_AND_REJECT_PROPOSALS: 'CALL.APPROVE_AND_REJECT_PROPOSALS',
  CLOSE_ROUNDS: 'CALL.CLOSE_ROUNDS',
  CREATE_ACCESS_SUBNET: 'ACCESS_SUBNET.CREATE',
  UPDATE_ACCESS_SUBNET: 'ACCESS_SUBNET.UPDATE',
  DELETE_ACCESS_SUBNET: 'ACCESS_SUBNET.DELETE',
  UPDATE_OFFERING_USER_RESTRICTION: 'OFFERINGUSER.UPDATE_RESTRICTION',
};
