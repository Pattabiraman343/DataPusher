'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Users', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    role_name: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Users');
}
