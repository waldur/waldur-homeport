import { FC } from 'react';

interface OwnProps {
  className?: string;
}

export const ModalSubtitle: FC<OwnProps> = (props) => (
  <h5 className={'modal-subtitle ' + props.className}>{props.children}</h5>
);
