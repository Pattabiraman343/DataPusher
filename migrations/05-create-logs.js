'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Logs', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    event_id: { type: Sequelize.UUID, allowNull: false },
    account_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' }, onDelete: 'CASCADE' },
    destination_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Destinations', key: 'id' }, onDelete: 'CASCADE' },
    status: { type: Sequelize.STRING, allowNull: false },
    received_data: { type: Sequelize.JSON },
    error_message: { type: Sequelize.TEXT },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Logs');
}
