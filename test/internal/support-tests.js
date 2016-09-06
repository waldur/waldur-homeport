var auth = require('../helpers/auth.js'),
    helpers = require('../helpers/helpers.js'),
    pages = require('../helpers/support-pages.js');

function gotoSupport() {
  element(by.css('ul.nav-list li.customer-support a')).click();
}

describe('List and create issue', function() {
  var user = auth.getUser('Alice');
  var uuid = helpers.getUUID();
  var issue = {
    summary: "Not able to invite new user " + uuid,
    description: "When I click on add user button error message is displayed"
  };

  xit('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  xit('I should be able to go to "Organization support" page', function() {
    gotoSupport();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/support/');
  });

  xit('I should be able to add new issue', function() {
    var listPage = new pages.ListIssuesPage();
    listPage.gotoCreateIssue();

    var createPage = new pages.CreateIssuePage();
    createPage.setSummary(issue.summary);
    createPage.setDescription(issue.description);
    createPage.submit();

  });

  // TODO: server response is too long for issues filtering
  // remove skip test when pending request for filtering by issues will not throw timeout error
  xit('I should be able to find added issue', function() {
    var listPage = new pages.ListIssuesPage();
    element(by.model('entityList.searchInput')).sendKeys(uuid);
    expect(listPage.containsIssue(issue.summary)).toBe(true);
  });

  // TODO: doesn't work without 'I should be able to find added issue' test
  xit('I should be able to add new comment', function() {
    var listPage = new pages.ListIssuesPage();
    listPage.expandIssue(issue.summary);

    var comments = new pages.IssueCommentsFragment();
    var text = "Won't fix " + helpers.getUUID();
    comments.setText(text);
    comments.submit();
    expect(comments.contains(text)).toBe(true);
  })
});
