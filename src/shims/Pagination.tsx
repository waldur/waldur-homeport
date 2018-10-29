import * as classNames from 'classnames';
import * as React from 'react';
import { bsClass, getClassSet, splitBsProps } from 'react-bootstrap/lib/utils/bootstrapUtils';

import PaginationButton from './PaginationButton';

interface PaginationProps {
  activePage: number;
  items: number;
  maxButtons: number;

  /**
   * When `true`, will display the first and the last button page when
   * displaying ellipsis.
   */
  boundaryLinks: boolean;

  /**
   * When `true`, will display the default node value ('&hellip;').
   * Otherwise, will display provided node (when specified).
   */
  ellipsis: boolean | React.ReactNode;

  /**
   * When `true`, will display the default node value ('&laquo;').
   * Otherwise, will display provided node (when specified).
   */
  first: boolean | React.ReactNode;

  /**
   * When `true`, will display the default node value ('&raquo;').
   * Otherwise, will display provided node (when specified).
   */
  last: boolean | React.ReactNode;

  /**
   * When `true`, will display the default node value ('&lsaquo;').
   * Otherwise, will display provided node (when specified).
   */
  prev: boolean | React.ReactNode;

  /**
   * When `true`, will display the default node value ('&rsaquo;').
   * Otherwise, will display provided node (when specified).
   */
  next: boolean | React.ReactNode;

  onSelect(): void;

  /**
   * You can use a custom element for the buttons
   */
  buttonComponentClass: React.ComponentType<{disabled?: boolean, onClick: any}>;

  className?: string;
}

class Pagination extends React.Component<PaginationProps> {
  static defaultProps = {
    activePage: 1,
    items: 1,
    maxButtons: 0,
    first: false,
    last: false,
    prev: false,
    next: false,
    ellipsis: true,
    boundaryLinks: false,
  };

  renderPageButtons(
    activePage, items, maxButtons, boundaryLinks, ellipsis, buttonProps
  ) {
    const pageButtons = [];

    let startPage;
    let endPage;

    if (maxButtons && maxButtons < items) {
      startPage = Math.max(
        Math.min(
          activePage - Math.floor(maxButtons / 2),
          items - maxButtons + 1
        ),
        1
      );
      endPage = startPage + maxButtons - 1;
    } else {
      startPage = 1;
      endPage = items;
    }

    for (let page = startPage; page <= endPage; ++page) {
      pageButtons.push(
        <PaginationButton
          {...buttonProps}
          key={page}
          eventKey={page}
          active={page === activePage}
        >
          {page}
        </PaginationButton>
      );
    }

    if (ellipsis && boundaryLinks && startPage > 1) {
      if (startPage > 2) {
        pageButtons.unshift(
          <PaginationButton
            key="ellipsisFirst"
            disabled={true}
            componentClass={buttonProps.componentClass}
          >
            <span aria-label="More">
              {ellipsis === true ? '\u2026' : ellipsis}
            </span>
          </PaginationButton>
        );
      }

      pageButtons.unshift(
        <PaginationButton
          {...buttonProps}
          key={1}
          eventKey={1}
          active={false}
        >
          1
        </PaginationButton>
      );
    }

    if (ellipsis && endPage < items) {
      if (!boundaryLinks || endPage < items - 1) {
        pageButtons.push(
          <PaginationButton
            key="ellipsis"
            disabled={true}
            componentClass={buttonProps.componentClass}
          >
            <span aria-label="More">
              {ellipsis === true ? '\u2026' : ellipsis}
            </span>
          </PaginationButton>
        );
      }

      if (boundaryLinks) {
        pageButtons.push(
          <PaginationButton
            {...buttonProps}
            key={items}
            eventKey={items}
            active={false}
          >
            {items}
          </PaginationButton>
        );
      }
    }

    return pageButtons;
  }

  render() {
    const {
      activePage,
      items,
      maxButtons,
      boundaryLinks,
      ellipsis,
      first,
      last,
      prev,
      next,
      onSelect,
      buttonComponentClass,
      className,
      ...props} = this.props;

    const [bsProps, elementProps] = splitBsProps(props);

    const classes = getClassSet(bsProps);

    const buttonProps = {
      onSelect,
      componentClass: buttonComponentClass,
    };

    return (
      <ul
        {...elementProps}
        className={classNames(className, classes)}
      >
        {first && (
          <PaginationButton
            {...buttonProps}
            eventKey={1}
            disabled={activePage === 1}
          >
            <span aria-label="First">
              {first === true ? '\u00ab' : first}
            </span>
          </PaginationButton>
        )}
        {prev && (
          <PaginationButton
            {...buttonProps}
            eventKey={activePage - 1}
            disabled={activePage === 1}
          >
            <span aria-label="Previous">
              {prev === true ? '\u2039' : prev}
            </span>
          </PaginationButton>
        )}

        {this.renderPageButtons(
          activePage, items, maxButtons, boundaryLinks, ellipsis, buttonProps
        )}

        {next && (
          <PaginationButton
            {...buttonProps}
            eventKey={activePage + 1}
            disabled={activePage >= items}
          >
            <span aria-label="Next">
              {next === true ? '\u203a' : next}
            </span>
          </PaginationButton>
        )}
        {last && (
          <PaginationButton
            {...buttonProps}
            eventKey={items}
            disabled={activePage >= items}
          >
            <span aria-label="Last">
              {last === true ? '\u00bb' : last}
            </span>
          </PaginationButton>
        )}
      </ul>
    );
  }
}

export default bsClass('pagination', Pagination);
