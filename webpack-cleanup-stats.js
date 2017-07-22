// See also: https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/97
class CleanUpStatsPlugin {
  /**
   * @param {Object} child
   * @param {string} child.name
   * @returns {boolean}
   */
  shouldPickStatChild(child) {
    return child.name.indexOf('extract-text-webpack-plugin') !== 0;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      if (Array.isArray(stats.compilation.children)) {
        stats.compilation.children = stats.compilation.children.filter(child => this.shouldPickStatChild(child));
      }
    });
  }
}

module.exports = CleanUpStatsPlugin;
