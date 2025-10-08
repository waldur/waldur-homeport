import {
  DataUtil,
  getObjectPropertyValueByKey,
  stringSnakeToCamel,
  getAttributeValueByBreakpoint,
  getViewPort,
  isVisibleElement,
  throttle,
  getCSS,
  ElementStyleUtil,
} from '../_utils/index';

interface ScrollOptions {
  saveState?: boolean;
}

const defaultScrollOptions: ScrollOptions = {
  saveState: true,
};

class ScrollComponent {
  element: HTMLElement;
  options: ScrollOptions;
  id: string;

  constructor(_element: HTMLElement, options: ScrollOptions) {
    this.element = _element;
    this.options = Object.assign(defaultScrollOptions, options);
    this.id = this.element.getAttribute('id') || '';
    this.update();
    DataUtil.set(this.element, 'scroll', this);
  }

  private getOption = (name: string) => {
    if (this.element.hasAttribute('data-kt-scroll-' + name) === true) {
      const attr = this.element.getAttribute('data-kt-scroll-' + name) || '';
      let value: string | JSON | boolean = getAttributeValueByBreakpoint(attr);
      if (value !== null && String(value) === 'true') {
        value = true;
      } else if (value !== null && String(value) === 'false') {
        value = false;
      }

      return value;
    } else {
      const optionName = stringSnakeToCamel(name);
      const option = getObjectPropertyValueByKey(this.options, optionName);
      if (option) {
        return getAttributeValueByBreakpoint(option);
      } else {
        return null;
      }
    }
  };

  private getHeightType = () => {
    if (this.getOption('height')) {
      return 'height';
    }
    if (this.getOption('min-height')) {
      return 'min-height';
    }
    if (this.getOption('max-height')) {
      return 'max-height';
    }
  };

  private getAutoHeight = () => {
    let height: number | string = getViewPort().height;
    const dependencies = this.getOption('dependencies');
    const wrappers = this.getOption('wrappers');
    const offset = this.getOption('offset');

    // Height dependencies
    if (dependencies !== null) {
      const elements = document.querySelectorAll(dependencies as string);
      if (elements && elements.length > 0) {
        for (let i = 0, len = elements.length; i < len; i++) {
          const element = elements[i] as HTMLElement;
          if (isVisibleElement(element) === false) {
            continue;
          }

          height = height - parseInt(getCSS(element, 'height'));
          height = height - parseInt(getCSS(element, 'margin-top'));
          height = height - parseInt(getCSS(element, 'margin-bottom'));

          const borderTop = getCSS(element, 'border-top');
          if (borderTop) {
            height = height - parseInt(borderTop);
          }

          const borderBottom = getCSS(element, 'border-bottom');
          if (borderBottom) {
            height = height - parseInt(borderBottom);
          }
        }
      }
    }

    // Wrappers
    if (wrappers !== null) {
      const elements = document.querySelectorAll(wrappers as string);
      if (elements && elements.length > 0) {
        for (let i = 0, len = elements.length; i < len; i++) {
          const element = elements[i] as HTMLElement;

          if (!isVisibleElement(element)) {
            continue;
          }

          height = height - parseInt(getCSS(element, 'margin-top'));
          height = height - parseInt(getCSS(element, 'margin-bottom'));
          height = height - parseInt(getCSS(element, 'padding-top'));
          height = height - parseInt(getCSS(element, 'padding-bottom'));

          const borderTop = getCSS(element, 'border-top');
          if (borderTop) {
            height = height - parseInt(borderTop);
          }

          const borderBottom = getCSS(element, 'border-bottom');
          if (borderBottom) {
            height = height - parseInt(borderBottom);
          }
        }
      }
    }

    // Custom offset
    if (offset !== null) {
      height = height - parseInt(offset as string);
    }

    height = height - parseInt(getCSS(this.element, 'margin-top'));
    height = height - parseInt(getCSS(this.element, 'margin-bottom'));

    const borderTop = getCSS(this.element, 'border-top');
    if (borderTop) {
      height = height - parseInt(borderTop);
    }

    const borderBottom = getCSS(this.element, 'border-bottom');
    if (borderBottom) {
      height = height - parseInt(borderBottom);
    }

    height = String(height) + 'px';

    return height;
  };

  private setupHeight = () => {
    const height = this.getHeight();
    const heightType = this.getHeightType() as string;

    // Set height
    if (height !== null && height.length > 0) {
      ElementStyleUtil.set(this.element, heightType, height);
    } else {
      ElementStyleUtil.set(this.element, heightType, '');
    }
  };

  private resetHeight = () => {
    const heghtType = this.getHeightType();
    if (heghtType) {
      ElementStyleUtil.set(this.element, heghtType, '');
    }
  };

  ///////////////////////
  // ** Public API  ** //
  ///////////////////////
  public update = () => {
    // Activate/deactivate
    if (
      this.getOption('activate') === true ||
      !this.element.hasAttribute('data-kt-scroll-activate')
    ) {
      this.setupHeight();
    } else {
      this.resetHeight();
    }
  };

  public getHeight = () => {
    const heightType = this.getHeightType();
    const height = this.getOption(heightType || '');
    if (height instanceof Function) {
      return height.call(height);
    } else if (
      height !== null &&
      typeof height === 'string' &&
      height.toLowerCase() === 'auto'
    ) {
      return this.getAutoHeight();
    } else {
      return height;
    }
  };

  public getElement = () => {
    return this.element;
  };

  // Static methods
  public static hasInstace(element: HTMLElement) {
    return DataUtil.has(element, 'scroll');
  }

  public static getInstance(element: HTMLElement) {
    if (element !== null && ScrollComponent.hasInstace(element)) {
      return DataUtil.get(element, 'scroll');
    }
  }

  // Create Instances
  public static createInstances(selector: string) {
    const elements = document.body.querySelectorAll(selector);
    elements.forEach((element: Element) => {
      const item = element as HTMLElement;
      let scroll = ScrollComponent.getInstance(item);
      if (!scroll) {
        scroll = new ScrollComponent(item, defaultScrollOptions);
      }
    });
  }

  public static bootstrap(attr = '[data-kt-scroll="true"]') {
    ScrollComponent.createInstances(attr);
    ScrollComponent.resize();
  }

  public static createInstance = (
    element: HTMLElement,
    options: ScrollOptions = defaultScrollOptions,
  ): ScrollComponent | undefined => {
    let scroll = ScrollComponent.getInstance(element);
    if (!scroll) {
      scroll = new ScrollComponent(element, options);
    }
    return scroll;
  };

  public static reinitialization(attr = '[data-kt-scroll="true"]') {
    ScrollComponent.createInstances(attr);
  }

  public static updateAll() {
    const elements = document.body.querySelectorAll('[data-kt-scroll="true"]');
    elements.forEach((element: Element) => {
      const instance = ScrollComponent.getInstance(element as HTMLElement);
      if (instance) {
        instance.update();
      }
    });
  }

  public static resize() {
    // Window Resize Handling
    window.addEventListener('resize', function () {
      // oxlint-disable-next-line no-unassigned-vars
      let timer;
      throttle(
        timer,
        () => {
          // Locate and update Drawer instances on window resize
          ScrollComponent.updateAll();
        },
        200,
      );
    });
  }
}

export { ScrollComponent };
