import { useRef, useCallback, useEffect, FunctionComponent } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';

export const BaseList: FunctionComponent<{
  items;
  selectedItem;
  selectItem;
  EmptyPlaceholder;
  ItemComponent;
  linkState?;
}> = ({
  items,
  selectedItem,
  selectItem,
  EmptyPlaceholder,
  ItemComponent,
  linkState,
}) => {
  const scrollBarRef = useRef<Scrollbars>();
  const itemId = selectedItem?.uuid;

  const adjustScroll = useCallback(() => {
    if (itemId) {
      const view = scrollBarRef.current.view;
      const query = `[data-uuid="${itemId}"]`;
      const itemElement = view.querySelector(query);
      if (itemElement) {
        view.scrollTop = itemElement.offsetTop;
      }
    }
  }, [scrollBarRef, itemId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(adjustScroll, []);

  return (
    <Scrollbars ref={scrollBarRef} className="scrollbar">
      <ListGroup>
        {items.length === 0 ? (
          <ListGroupItem>
            <EmptyPlaceholder />
          </ListGroupItem>
        ) : (
          items.map((item) => (
            <ItemComponent
              key={item.uuid}
              item={item}
              selectedItem={selectedItem}
              onClick={selectItem}
              linkState={linkState}
            />
          ))
        )}
      </ListGroup>
    </Scrollbars>
  );
};
