import { IdNamePair } from './types';

export const OptionsList = ({
  label,
  list,
}: {
  label: string;
  list: IdNamePair[];
}) =>
  list ? (
    <>
      <h4 className="fw-normal">{label}</h4>
      <p>{list.map((c) => c.name || c).join(', ')}</p>
    </>
  ) : null;
