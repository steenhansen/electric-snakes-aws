
// npx gulp to copy down the configs without TypeScript copying every value

var fs = require('fs');
var gulp = require('gulp');

const { STACK_NAME, DOMAIN_NAME, BACKEND_SUBDOMAIN, BACKEND_DEV_SUBDOMAIN } = require('../../electric-snakes-aws.config.json');

const the_json = {
  "domain_name": DOMAIN_NAME,
  "backend_subdomain": BACKEND_SUBDOMAIN,
  "backend_dev_subdomain": BACKEND_DEV_SUBDOMAIN,
  "STACK_NAME": STACK_NAME
};

gulp.task('default', function (cb) {
  const stringified = JSON.stringify(the_json, null, 2);
  fs.writeFileSync('config.json', stringified);
  console.log("server config.js");
  cb();
});



