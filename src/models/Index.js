import sequelize from "../config/db.js";   // ✅ import your sequelize instance
import Account from "./Account.js";
import Destination from "./Destination.js";
import User from "./User.js";
import Role from "./Role.js";
import AccountMember from "./AccountMember.js";
import Log from "./Log.js";

// Associations
Account.hasMany(Destination, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});
Destination.belongsTo(Account, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});

Destination.hasMany(Log, {
  foreignKey: "destination_id",
  onDelete: "CASCADE",
});
Log.belongsTo(Destination, {
  foreignKey: "destination_id",
  onDelete: "CASCADE",
});

Account.hasMany(Log, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});
Log.belongsTo(Account, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});

Account.hasMany(AccountMember, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});
AccountMember.belongsTo(Account, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});

User.hasMany(AccountMember, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
AccountMember.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Role.hasMany(User, {
  foreignKey: "role_id",
  onDelete: "CASCADE",
});
User.belongsTo(Role, {
  foreignKey: "role_id",
  onDelete: "CASCADE",
});

export {
  sequelize,   // ✅ now sequelize is exported
  Account,
  Destination,
  User,
  Role,
  AccountMember,
  Log,
};
