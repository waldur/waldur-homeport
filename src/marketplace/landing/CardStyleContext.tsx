import { createContext, FC, ReactNode, useContext } from 'react';

import { CardStyleType, DEFAULT_CARD_STYLE } from '../common/cards/index';

interface CardStyleContextValue {
  cardStyle: CardStyleType;
}

const CardStyleContext = createContext<CardStyleContextValue>({
  cardStyle: DEFAULT_CARD_STYLE,
});

export const CardStyleProvider: FC<{
  cardStyle: CardStyleType;
  children: ReactNode;
}> = ({ cardStyle, children }) => (
  <CardStyleContext.Provider value={{ cardStyle }}>
    {children}
  </CardStyleContext.Provider>
);

export const useCardStyle = (): CardStyleType => {
  const context = useContext(CardStyleContext);
  return context.cardStyle;
};
