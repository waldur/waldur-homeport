import { FunctionComponent } from 'react';
import './Tag.scss';

interface TagProps {
  text: string; // fixme: should be "divisions: string[]"
}

export const Tag: FunctionComponent<TagProps> = ({ text }) => (
  <div className="tag-container">{text}</div>
);
