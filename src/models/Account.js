import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import crypto from "crypto";

const Account = sequelize.define("Account", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  account_name: { type: DataTypes.STRING, allowNull: false },
  website: { type: DataTypes.STRING, allowNull: true },
  app_secret_token: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => crypto.randomBytes(32).toString("hex"),
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "accounts",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { fields: ["account_name"] },
    { fields: ["created_at"] },
    { fields: ["updated_at"] },
    { unique: true, fields: ["app_secret_token"] },
  ],
});

export default Account;
