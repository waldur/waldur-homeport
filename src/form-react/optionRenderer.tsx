import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export type AttrGetter = string | ((option: any) => string);

export interface RendererConfig {
  iconKey: AttrGetter;
  labelKey: AttrGetter;
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
  let label;
  if (typeof labelKey === 'function') {
    label = labelKey(option);
  } else {
    label = option[labelKey];
  }
  const img = renderIcon(src, imgStyle);
  if (tooltipKey) {
    return (
      <div style={{overflow: 'hidden'}}>
        <Tooltip label={option[tooltipKey]} id="iconTooltip" children={img}/>
        {label}
      </div>
    );
  }
  return (
    <div style={{overflow: 'hidden'}}>
      {img}
      {label}
    </div>
  );
};
