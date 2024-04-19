import { Tip } from '@waldur/core/Tooltip';

export const QuestionMark = ({ tooltip }) => {
  return (
    <Tip id="form-field-tooltip" label={tooltip} placement="left">
      <div className="symbol symbol-45px symbol-circle mt-1">
        <div className="symbol-label fs-2 fw-semibold text-muted">?</div>
      </div>
    </Tip>
  );
};
