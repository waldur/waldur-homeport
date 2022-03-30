import { FC, createContext, useContext, useState, useEffect } from 'react';

import { DefaultLayoutConfig } from './DefaultLayoutConfig';
import {
  ILayout,
  ILayoutCSSVariables,
  ILayoutCSSClasses,
  ILayoutHTMLAttributes,
} from './LayoutModels';
import {
  getEmptyCssClasses,
  getEmptyCSSVariables,
  getEmptyHTMLAttributes,
  LayoutSetup,
} from './LayoutSetup';

export interface LayoutContextModel {
  config: ILayout;
  classes: ILayoutCSSClasses;
  attributes: ILayoutHTMLAttributes;
  cssVariables: ILayoutCSSVariables;
  setLayout: (config: LayoutSetup) => void;
}

const LayoutContext = createContext<LayoutContextModel>({
  config: DefaultLayoutConfig,
  classes: getEmptyCssClasses(),
  attributes: getEmptyHTMLAttributes(),
  cssVariables: getEmptyCSSVariables(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLayout: () => {},
});

const enableSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    splashScreen.style.setProperty('display', 'flex');
  }
};

const disableSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    splashScreen.style.setProperty('display', 'none');
  }
};

const LayoutProvider: FC = ({ children }) => {
  const [config, setConfig] = useState(LayoutSetup.config);
  const [classes, setClasses] = useState(LayoutSetup.classes);
  const [attributes, setAttributes] = useState(LayoutSetup.attributes);
  const [cssVariables, setCSSVariables] = useState(LayoutSetup.cssVariables);
  const setLayout = (_themeConfig: Partial<ILayout>) => {
    enableSplashScreen();
    const bodyClasses = Array.from(document.body.classList);
    bodyClasses.forEach((cl) => document.body.classList.remove(cl));
    LayoutSetup.updatePartialConfig(_themeConfig);
    setConfig(Object.assign({}, LayoutSetup.config));
    setClasses(LayoutSetup.classes);
    setAttributes(LayoutSetup.attributes);
    setCSSVariables(LayoutSetup.cssVariables);
    setTimeout(() => {
      disableSplashScreen();
    }, 500);
  };
  const value: LayoutContextModel = {
    config,
    classes,
    attributes,
    cssVariables,
    setLayout,
  };

  useEffect(() => {
    disableSplashScreen();
  }, []);

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export { LayoutContext, LayoutProvider };

export function useLayout() {
  return useContext(LayoutContext);
}
