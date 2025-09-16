import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  role_name: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: "roles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { unique: true, fields: ["role_name"] },
  ],
});

export default Role;
