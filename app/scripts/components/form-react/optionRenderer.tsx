import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export type IconGetter = (option: any) => string;

export interface RendererConfig {
  iconKey: string | IconGetter;
  labelKey: string;
  tooltipKey?: string;
  imgStyle?: {};
}

const renderIcon = (src, imgStyle) => (
  <img src={src} style={{
    display: 'inline-block',
    marginRight: 10,
    position: 'relative',
    top: -2,
    verticalAlign: 'middle',
    ...imgStyle,
  }}/>
);

export const optionRenderer = (config: RendererConfig) => option => {
  const {iconKey, labelKey, tooltipKey, imgStyle} = config;
  let src;
  if (typeof iconKey === 'function') {
    src = iconKey(option);
  } else {
    src = option[iconKey];
  }
  const img = renderIcon(src, imgStyle);
  if (tooltipKey) {
    return (
      <div>
        <Tooltip label={option[tooltipKey]} id="iconTooltip" children={img}/>
        {option[labelKey]}
      </div>
    );
  }
  return (
    <div>
      {img}
      {option[labelKey]}
    </div>
  );
};
