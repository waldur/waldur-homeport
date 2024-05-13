import { Hexagon } from '@phosphor-icons/react';

export const HexagonShape = () => (
  <div className="d-flex h-80px w-80px flex-shrink-0 flex-center position-relative align-self-start align-self-lg-center mt-3 mt-lg-0">
    <span className="svg-icon svg-icon-success position-absolute opacity-15">
      <Hexagon />
    </span>

    <span className="svg-icon svg-icon-2x svg-icon-lg-3x svg-icon-primary position-absolute">
      <i className="fa fa-wrench fa-3x text-success" />
    </span>
  </div>
);
