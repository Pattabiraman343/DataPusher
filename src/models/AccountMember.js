import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Account from "./Account.js";
import User from "./User.js";
import Role from "./Role.js";

const AccountMember = sequelize.define("AccountMember", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  account_id: { type: DataTypes.INTEGER, references: { model: Account, key: "id" }, allowNull: false },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" }, allowNull: false },
  role_id: { type: DataTypes.INTEGER, references: { model: Role, key: "id" }, allowNull: false },
}, {
  tableName: "account_members",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { fields: ["account_id"] },
    { fields: ["user_id"] },
    { fields: ["role_id"] },
    { unique: true, fields: ["account_id", "user_id"] }, // prevent duplicate membership
  ],
});

Account.hasMany(AccountMember, { foreignKey: "account_id" });
User.hasMany(AccountMember, { foreignKey: "user_id" });
Role.hasMany(AccountMember, { foreignKey: "role_id" });

AccountMember.belongsTo(Account, { foreignKey: "account_id" });
AccountMember.belongsTo(User, { foreignKey: "user_id" });
AccountMember.belongsTo(Role, { foreignKey: "role_id" });

export default AccountMember;
