import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { addTheme } from './navigation/header/store';

function getThemeLinkTag(dark = false) {
  const matchRegex = dark ? /dark-bundle/ : /light-bundle/;
  const linkTags = document.getElementsByTagName('link');
  for (let i = 0; i < linkTags.length; i++) {
    if (linkTags.item(i).href.match(matchRegex)) {
      return linkTags.item(i);
    }
  }
  return null;
}
function removeAnotherTheme(newTheme) {
  const tag = getThemeLinkTag(newTheme !== 'dark');
  if (tag) tag.remove();
}
function replaceTheme(newTheme, newThemeHref) {
  const tag = getThemeLinkTag(newTheme !== 'dark');
  if (tag) tag.setAttribute('href', newThemeHref);
}

export const ThemeSelector: FunctionComponent = () => {
  const { theme, themes } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();

  /**
   * This function uses dynamic import to load themes, without reloading the webpage
   */
  const loadTheme = useCallback(
    (newTheme) => {
      // Replace href attribute of link tag, for next times
      if (themes[newTheme]) {
        replaceTheme(newTheme, themes[newTheme]);
        return;
      }
      // For the first time invoke of dark/light theme
      if (newTheme === 'dark') {
        import(
          /* webpackChunkName: "dark" */ '@waldur/metronic/assets/sass/style.dark.scss'
        ).then(() => {
          const newThemes = {
            ...themes,
            [newTheme]: getThemeLinkTag(true)?.getAttribute('href'),
          };
          dispatch(addTheme(newThemes));
          removeAnotherTheme(newTheme);
        });
      } else if (newTheme === 'light') {
        import(
          /* webpackChunkName: "light" */ '@waldur/metronic/assets/sass/style.scss'
        ).then(() => {
          const newThemes = {
            ...themes,
            [newTheme]: getThemeLinkTag()?.getAttribute('href'),
          };
          dispatch(addTheme(newThemes));
          removeAnotherTheme(newTheme);
        });
      }
    },
    [themes],
  );

  useEffect(() => {
    if (theme === 'dark') loadTheme('dark');
    else loadTheme('light');
  }, [theme]);

  return <></>;
};
