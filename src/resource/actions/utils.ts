import { EditAction } from '@waldur/marketplace/resources/actions/EditAction';
import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';

export const parseValidators = (validators, context) => {
  let reason = '';
  if (validators) {
    for (const validator of validators) {
      reason = validator(context);
      if (reason) {
        return reason;
      }
    }
  }
};

export const getResourceCommonActions = () => {
  return [
    EditAction,
    MoveResourceAction,
    SubmitReportAction,
    ChangePlanAction,
    ChangeLimitsAction,
    SetBackendIdAction,
    EditResourceEndDateAction,
  ];
};
