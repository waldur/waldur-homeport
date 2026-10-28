import { FunctionComponent } from 'react';

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
  return (
    <div className="scrollbar">
      <div className="list-group">
        {items.length === 0 ? (
          <div className="list-group-item">
            <EmptyPlaceholder />
          </div>
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
      </div>
    </div>
  );
};
