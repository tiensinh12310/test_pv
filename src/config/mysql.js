const fs = require('fs');
const path = require('path');
const { mysqlUri } = require('./vars');
const Sequelize = require('sequelize');

const db = {};

const sequelize = new Sequelize(mysqlUri, {
    logging: false,
    timezone: '+07:00',
    typeCast(field, next) { // for reading from database
        if (field.type === 'DATETIME') {
            return field.string();
        }
        return next();
    },
    dialectOptions: {
        supportBigNumbers: true,
    },
    benchmark: true,
    pool: {
        max: 100,
        min: 0,
        acquire: 60000,
        idle: 10000
    },
});
const baseDir = path.join(__dirname, '../api/models');

fs
    .readdirSync(baseDir)
    .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js') && (file.indexOf('.model') === -1))
    .forEach((file, index) => {
        const model = require(path.join(baseDir, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
        // db[model.name].sync({});
    });

Object.keys(db).forEach((modelName) => {
    if(db[modelName].associate){
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;