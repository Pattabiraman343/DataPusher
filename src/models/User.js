import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { unique: true, fields: ["email"] },
    { fields: ["created_at"] },
  ],
});

// Hash password before save
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

export default User;
