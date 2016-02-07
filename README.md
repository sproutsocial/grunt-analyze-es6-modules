# grunt-analyze-es6-modules

grunt-analyze-es6-modules is a grunt wrapper around the [analyze-es6-modules](https://github.com/sproutsocial/analyze-es6-modules) package.

## Usage

This plugin follows all of the grunt [multi-task](http://gruntjs.com/creating-tasks#multi-tasks) conventions. Documentation for the different configuration options can be found below.

### Configuration

Be sure to read [the documentation for analyze-es6-modules](https://github.com/sproutsocial/analyze-es6-modules) before using any of the options found below. 

- `options`: An object containing options passed directly to the analyze-es6-modules package. Documentation for those options can be found [here](https://github.com/sproutsocial/analyze-es6-modules#configuration).
- `issueFilter`: An optional function that will filter down issues.
- `getIssueSeverity`: An optional function that takes an issue and returns the severity for the issue. The severity can be either `error`, `warning`, or `none`. (See more about severity below.)
- `getMessageForIssue`: An optional function that takes an issue and returns a string error/warning message.
- `reportIssue`: An optional function that takes a severity, a message, and an issue, and reports the error in some way. The default implementation uses `console.error` and `console.warning`.

#### Issue Severity

By default, every issue is assigned a severity. The default severities can be found below:

| Issue Type | Severity |
|---|---|
| missingModule | error |
| badImport | error |
| duplicateExport | error |
| unusedModule | warning |
| unusedExport | warning |

As of now, there are only three severities: `error`, `warning`, and `none`. That may change in the future.

### Task Status

This task will return a successful error code if there are no issues with severity `error`. If there are any issues with severity `error`, this task will fail. Other severity issues will not affect the task status.