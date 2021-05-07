Promise = require('bluebird');
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');

require('./config/errors')(app);
require('./config/mysql');

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = app;


