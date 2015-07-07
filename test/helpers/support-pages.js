function ListIssuesPage() {
  expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/support/');
}

ListIssuesPage.prototype = {
  gotoCreateIssue: function() {
    element(by.cssContainingText('a', 'Create ticket')).click();
  },

  containsIssue: function(summary) {
    return element(by.cssContainingText('a', summary)).isPresent();
  },

  expandIssue: function(summary) {
    element(by.cssContainingText('div.list-item', summary)).click();
  }
};

function IssueCommentsFragment () {}

IssueCommentsFragment.prototype = {
  setText: function(text) {
    element.all(by.model('issue.newCommentBody')).first().sendKeys(text);
  },

  submit: function() {
    element(by.cssContainingText('a.button-apply', 'Submit message')).click();
  },

  contains: function(text) {
    return element(by.cssContainingText('article.normal-description', text)).isPresent();
  }
};

function CreateIssuePage() {
  expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/support/add/');
}

CreateIssuePage.prototype = {
  setSummary: function(summary) {
    element(by.model('IssueAdd.issue.summary')).sendKeys(summary);
  },

  setDescription: function(description) {
    element(by.model('IssueAdd.issue.description')).sendKeys(description);
  },

  submit: function() {
    element(by.cssContainingText('a.button-apply', 'Open ticket')).click();
  }
};

module.exports.ListIssuesPage = ListIssuesPage;
module.exports.CreateIssuePage = CreateIssuePage;
module.exports.IssueCommentsFragment = IssueCommentsFragment;