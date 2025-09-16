import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Log = sequelize.define("Log", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: { type: DataTypes.STRING, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: User, key: "id" } },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING, allowNull: false },
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
  account_id: { type: DataTypes.INTEGER, allowNull: true },
  destination_id: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: "logs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
  indexes: [
    { fields: ["event_id"] },
    { fields: ["account_id"] },
    { fields: ["destination_id"] },
    { fields: ["status"] },
    { fields: ["created_at"] },
  ],
});

Log.belongsTo(User, { foreignKey: "user_id" });

export default Log;
