import { FunctionComponent } from 'react';
import PlaceholderImage from 'react-simple-svg-placeholder';

interface LogoProps {
  image: string;
  placeholder: string;
  height: number;
  width: number;
}

export const Logo: FunctionComponent<LogoProps> = (props) =>
  props.image ? (
    <img src={props.image} height={props.height} width="auto" />
  ) : (
    <PlaceholderImage
      width={props.width}
      height={props.height}
      text={props.placeholder}
      fontSize={60}
    />
  );
