'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
var Lint = require('tslint');
var Rule = /** @class */ (function (_super) {
  __extends(Rule, _super);
  function Rule() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  Rule.prototype.apply = function (sourceFile) {
    return this.applyWithWalker(
      new ImportsWalker(sourceFile, this.getOptions()),
    );
  };
  Rule.FAILURE_STRING = 'import statement forbidden';
  return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var Category;
(function (Category) {
  Category[(Category['Global'] = 1)] = 'Global';
  Category[(Category['App'] = 2)] = 'App';
  Category[(Category['Local'] = 3)] = 'Local';
})(Category || (Category = {}));
// The walker takes care of all the work.
// tslint:disable-next-line max-classes-per-file
var ImportsWalker = /** @class */ (function (_super) {
  __extends(ImportsWalker, _super);
  function ImportsWalker() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  ImportsWalker.prototype.getCategory = function (importFrom) {
    if (!importFrom) {
      throw Error('importFrom must be defined');
    }
    if (importFrom.substr(0, 2) === './' || importFrom.substr(0, 3) === '../') {
      return Category.Local;
    }
    if (importFrom.substr(0, 7) === '@waldur') {
      return Category.App;
    }
    return Category.Global;
  };
  ImportsWalker.prototype.visitImportDeclaration = function (node) {
    var importFromDirty =
      node && node.moduleSpecifier && node.moduleSpecifier.getText();
    if (importFromDirty) {
      var importFrom = importFromDirty.replace(/['"]+/g, '');
      var fromCategory = this.getCategory(importFrom);
      if (this.lastFromCategory && this.lastFromCategory > fromCategory) {
        this.addFailure(
          this.createFailure(
            node.getStart(),
            node.getWidth(),
            'incorrect order of import categories, make sure imports are ordered global first, then @waldur, then local (./ or ../)',
          ),
        );
      }
      if (this.lastFromCategory && this.lastFromCategory !== fromCategory) {
        if (!/^(\r\n|\n|\r){2}/.test(node.getFullText())) {
          this.addFailure(
            this.createFailure(
              node.getStart(),
              node.getWidth(),
              'there must be at least one blank line between different import groups',
            ),
          );
        }
      }
      if (
        this.lastFrom &&
        this.lastFromCategory === fromCategory &&
        this.lastFrom.toUpperCase() > importFrom.toUpperCase()
      ) {
        this.addFailure(
          this.createFailure(
            node.getStart(),
            node.getWidth(),
            'imports within category must be sorted alphabetically',
          ),
        );
      }
      this.lastFromCategory = fromCategory;
      this.lastFrom = importFrom;
    }
    _super.prototype.visitImportDeclaration.call(this, node);
  };
  return ImportsWalker;
})(Lint.RuleWalker);
