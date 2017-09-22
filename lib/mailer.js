const _ = require('lodash');
const moment = require('moment');

/**
 * Compiles the given template string
 *
 * Creates a compiled template function that can interpolate data properties
 * in "interpolate" delimiters, HTML-escape interpolated data properties in
 * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
 * properties may be accessed as free variables in the template.
 *
 * @param {string} string
 */
function compile(string) {
  return _.template(string, { imports: { moment } });
}

function sendMail(data, callback) {
  // TODO: Implement
  console.log(data);
  callback();
}

module.exports = class Mailer {
  constructor(config) {
    this.config = config;
    this.templates = _.mapValues(config.templates, compile);
  }

  formatPullRequest(pr) {
    const repo = pr.repository_url.match('[^/]+/[^/]+$')[0];
    return this.templates.item({ repo, pr });
  }

  async send(user, pullRequests) {
    if (user.email == null) {
      return;
    }

    const userName = user.login; // TODO: Prefer the user's name (user.name)
    const items = pullRequests.map(pr => this.formatPullRequest(pr)).join('\n');
    const message = this.templates.message({ items, userName });
    const recipient = `"${userName}" <${user.email}>`;
    const subject = this.templates.subject({ count: pullRequests.length });

    const email = { from: this.config.sender, to: recipient, subject, html: message };
    await new Promise((resolve, reject) => sendMail(email, e => e && reject(e)));
  }
};