import { FunctionComponent } from 'react';
import './Division.scss';

interface DivisionProps {
  division: string;
}

export const Division: FunctionComponent<DivisionProps> = ({ division }) =>
  division ? <div className="divisionContainer">{division}</div> : null;
