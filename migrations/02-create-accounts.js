'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Accounts', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    account_name: { type: Sequelize.STRING, allowNull: false },
    app_secret_token: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Accounts');
}
