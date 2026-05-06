export const MOVE_RESOURCE_FORM_ID = 'MoveResourceForm';

// It is critical to keep this enum in sync with ResourceAction enum from API
export enum ResourceAction {
  TERMINATE = 'terminate',
  SWITCH_PLAN = 'switch_plan',
  UPDATE_LIMITS = 'update_limits',
  EDIT_TERMINATION_DATE = 'edit_termination_date',
  UPDATE_BACKEND_ID = 'update_backend_id',
  UNLINK = 'unlink',
  MOVE_RESOURCE = 'move_resource',
  SET_SLUG = 'set_slug',
  SHOW_USAGE = 'show_usage',
  SET_AS_ERRED = 'set_as_erred',
  CREATE_ROBOT_ACCOUNT = 'create_robot_account',
  SUBMIT_REPORT = 'submit_report',
  REPORT_USAGE = 'report_usage',
  VIEW_DETAILS = 'view_details',
  SYNCHRONIZE = 'synchronize',
  VERSION_HISTORY = 'version_history',
}
