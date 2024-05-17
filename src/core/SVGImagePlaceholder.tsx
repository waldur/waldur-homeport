import SimpleSvgPlaceholder from '@cloudfour/simple-svg-placeholder';

const defaults = {
  width: 300,
  height: 150,
  bgColor: '#aaa',
  textColor: '#333',
};

export const SVGImagePlaceholder = (props) => (
  <img
    src={SimpleSvgPlaceholder({ ...defaults, ...props })}
    alt="Placeholder"
  />
);
