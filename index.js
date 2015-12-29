var chalk = require('chalk');
var analyzeModules = require('analyze-es6-modules');

module.exports = function(grunt) {
	grunt.registerMultiTask('analyze-es6-modules', function() {
		var callback = this.async();

		try {
			gruntAnalyzeModules(this.data, callback);
		} catch (error) {
			grunt.log.error(error && error.stack);
			callback(false);
		}
	});

	function gruntAnalyzeModules(config, callback) {
		analyzeModules(config.options).then(function(result) {
			if (result.issues.length === 0) {
				callback(true);
				return;
			}

			callback(processResults(config, result));
		}, function(error) {
			grunt.log.error(error && error.stack);
			callback(false);
		}).then(undefined, function(error) {
			grunt.log.error('An error occurred while running the analyze-es6-modules task.');
			grunt.verbose.error(error && error.stack);
			callback(false);
		});
	}

	function processResults(config, results) {
		var issues = results.issues;
		if (config.issueFilter) {
			issues = issues.filter(config.issueFilter, config);
		}

		if (issues.length === 0) {
			return true;
		}

		var getIssueSeverity = (config.getIssueSeverity || defaultGetIssueSeverity).bind(config);
		var getMessageForIssue = (config.getMessageForIssue || defaultGetMessageForIssue).bind(config);

		var issueData = issues.map(function(issue) {
			return {
				issue: issue,
				severity: getIssueSeverity(issue),
				message: getMessageForIssue(issue)
			};
		});

		var reportIssue = (config.reportIssue || defaultReportIssue).bind(config);

		issueData.forEach(function(data) {
			reportIssue(data.severity, data.message, data.issue);
		});

		return issueData.every(function(data) {
			return (data.severity !== 'error');
		});
	}

	////////////////////////////////////////////////////////////////////////////////

	var issueSeverity = {
		missingModule: 'error',
		badImport: 'error',
		duplicateExport: 'error',
		unusedModule: 'warning',
		unusedExport: 'warning'
	};

	function defaultGetIssueSeverity(issue) {
		return issueSeverity[issue.type] || 'none';
	}

	function defaultGetMessageForIssue(issue) {
		switch (issue.type) {
			case 'missingModule':
				return (
						'Module `' + issue.importingModule + '` tried to reference module `' + issue.exportingModule.resolved +
						'` on line ' + issue.lineNumber + ' but no such module exists.'
				);
			case 'badImport':
				if (issue.exportType === 'default') {
					return (
							'Module `' + issue.importingModule + '` tried to import the default export from module `' +
							issue.exportingModule.resolved + '` but that module doesn\'t have a default export.'
					);
				} else {
					return (
							'Module `' + issue.importingModule + '` tried to import `' + issue.exportName + '` from module `' +
							issue.exportingModule.resolved + '` but that module doesn\'t have an export with that name.'
					);
				}
			case 'duplicateExport':
				if (issue.exportType === 'default') {
					return 'Module `' + issue.exportingModule + '` has 2 default exports.';
				} else {
					return 'Module `' + issue.exportingModule + '` has 2 exports named `' + issue.exportName + '`.';
				}
			case 'unusedModule':
				return 'Module `' + issue.module + '` isn\'t being used.';
			case 'unusedExport':
				if (issue.exportType === 'default') {
					return 'Module `' + issue.exportingModule + '` has a default export that isn\'t being used.';
				} else {
					return (
							'Module `' + issue.exportingModule + '` has an export named `' +
							issue.exportName + '` that isn\'t being used.'
					);
				}
		}
	}

	function defaultReportIssue(severity, message, issue) {
		switch (severity) {
			case 'error':
				grunt.log.writeln(chalk.red('>>') + '  ' + message);
				break;
			case 'warning':
				grunt.log.writeln(chalk.yellow('>>') + '  ' + message);
				break;
		}
	}
};