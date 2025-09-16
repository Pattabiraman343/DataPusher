import { sequelize } from '../models/Index.js';
import Role from '../models/Role.js';

const initDB = async () => {
  try {
    await sequelize.sync({ alter: true }); // ✅ creates missing tables
    console.log('✅ Database synced');

    await Role.findOrCreate({ where: { role_name: 'Admin' } });
    await Role.findOrCreate({ where: { role_name: 'Normal' } });
    console.log('✅ Roles seeded');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
};

export default initDB;
