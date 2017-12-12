import * as ts from 'typescript';
import * as Lint from 'tslint';

class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'import statement forbidden';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithWalker(new ImportsWalker(sourceFile, this.getOptions()));
  }
}

enum Category {
  Global = 1,
  App = 2,
  Local = 3,
}

// The walker takes care of all the work.
class ImportsWalker extends Lint.RuleWalker {
  private lastFrom: string;
  private lastFromCategory?: Category;

  private getCategory(importFrom: string): Category {
    if (!importFrom) throw Error('importFrom must be defined');
    if (importFrom.substr(0, 2) === './') return Category.Local;
    if (importFrom.substr(0, 7) === '@waldur') return Category.App;
    return Category.Global;
  }

  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const importFromDirty = node && node.moduleSpecifier && node.moduleSpecifier.getText();
    if (importFromDirty) {
      const importFrom = importFromDirty.replace(/['"]+/g, '');
      const fromCategory = this.getCategory(importFrom);
      // console.log('import > ' + importFrom + ' / ' + fromCategory);

      if (this.lastFromCategory && this.lastFromCategory > fromCategory) {
        this.addFailure(this.createFailure(
          node.getStart(), node.getWidth(),
          'incorrect order of import categories, make sure imports are ordered global first, then @waldur, then local (./)'));
      }

      if (this.lastFromCategory && this.lastFromCategory !== fromCategory) {
        if (!/^(\r\n|\n|\r){2}/.test(node.getFullText())) {
          this.addFailure(this.createFailure(
            node.getStart(), node.getWidth(),
            'there must be at least one blank line between different import groups'));
        }
      }

      if (this.lastFrom && this.lastFromCategory === fromCategory && this.lastFrom.toUpperCase() > importFrom.toUpperCase()) {
        this.addFailure(this.createFailure(
          node.getStart(), node.getWidth(),
          'imports within category must be sorted alphabetically'));
      }

      this.lastFromCategory = fromCategory;
      this.lastFrom = importFrom;
    }
    super.visitImportDeclaration(node);
  }
}

export {
  Rule,
};
