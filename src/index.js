Promise = require('bluebird');
const { port, env } = require('./config/vars');
const { sequelize } = require('./config/mysql');
const logger = require('./config/logger');
const app = require('./config/express');
const { createServer } = require('http');

require('./config/errors')(app);

// connect mysql
(async () => {
    try {
        await sequelize.authenticate();
        console.log('info: connected mysql');
    } catch (e) {
        console.log('error: mysql ', e);
    }
})();

const server = createServer(app);

// listen to requests
server.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = app;


