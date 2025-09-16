import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Account from "./Account.js";

const Destination = sequelize.define("Destination", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  account_id: { type: DataTypes.INTEGER, references: { model: Account, key: "id" }, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  headers: { type: DataTypes.JSON, allowNull: false },
}, {
  tableName: "destinations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { fields: ["account_id"] },
    { fields: ["url"] },
    { fields: ["method"] },
    { fields: ["created_at"] },
  ],
});

Account.hasMany(Destination, { foreignKey: "account_id" });
Destination.belongsTo(Account, { foreignKey: "account_id" });

export default Destination;
