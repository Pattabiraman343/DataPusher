'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Destinations', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    account_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' }, onDelete: 'CASCADE' },
    url: { type: Sequelize.STRING, allowNull: false },
    method: { type: Sequelize.STRING, allowNull: false },
    headers: { type: Sequelize.JSON },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Destinations');
}
