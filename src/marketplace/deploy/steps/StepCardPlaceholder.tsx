import { FC, PropsWithChildren } from 'react';

export const StepCardPlaceholder: FC<PropsWithChildren> = (props) => (
  <h2 className="text-quaternary text-center">{props.children}</h2>
);
