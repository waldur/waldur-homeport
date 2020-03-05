import { HELP_TITLES } from './constants';

class HelpRegistry {
  constructor() {
    this.helpData = {};
    this.isSorted = false;
  }

  register(type, data, title) {
    if (!type || !data) return;

    if (this.helpData[type]) {
      const helpItems = this.helpData[type].helpItems;

      for (let i = 0; i <= helpItems.length; i++) {
        if (i === helpItems.length || helpItems[i].name > data.name) {
          helpItems.splice(i, 0, data);
          break;
        }
      }
    } else {
      this.helpData[type] = {
        title: title || this.getTitle(type),
        helpItems: [data],
      };
      this.isSorted = false;
    }
  }

  getTitle(typeName) {
    return (
      (typeName && HELP_TITLES[typeName]) ||
      typeName[0].toUpperCase() + typeName.slice(1)
    );
  }

  get() {
    return this.helpData;
  }

  getSorted() {
    const sortedHelpData = [];

    if (this.isSorted) {
      return this.sortedHelpData;
    }

    for (const key in this.helpData) {
      sortedHelpData.push(this.helpData[key]);
    }
    sortedHelpData.sort((a, b) => {
      if (a.title > b.title) return 1;
      if (a.title < b.title) return -1;
    });
    this.sortedHelpData = sortedHelpData;
    this.isSorted = true;

    return sortedHelpData;
  }

  hasItem(type, name) {
    const helpItems = this.helpData[type] && this.helpData[type].helpItems;
    if (!helpItems) return false;

    for (const item of helpItems) {
      if (item.key === name) {
        return true;
      }
    }
    return false;
  }
}

const HelpRegistryController = new HelpRegistry();

export default HelpRegistryController;
