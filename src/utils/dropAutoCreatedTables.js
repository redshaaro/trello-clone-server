// utils/dropAutoCreatedTables.js
// One-time script to drop auto-created tables

const { sequelize } = require("../../models");

async function dropAutoCreatedTables() {
  try {
    console.log('🗑️  Dropping auto-created tables...');
    
    // Drop in reverse order of dependencies
    await sequelize.query('DROP TABLE IF EXISTS task_assignees CASCADE;');
    console.log('  ✅ Dropped task_assignees');
    
    await sequelize.query('DROP TABLE IF EXISTS task_labels CASCADE;');
    console.log('  ✅ Dropped task_labels');
    
    await sequelize.query('DROP TABLE IF EXISTS comments CASCADE;');
    console.log('  ✅ Dropped comments');
    
    await sequelize.query('DROP TABLE IF EXISTS labels CASCADE;');
    console.log('  ✅ Dropped labels');
    
    console.log('\n✅ All auto-created tables dropped successfully!');
    console.log('\n📌 Next step: Run migrations to create tables properly:');
    console.log('   npx sequelize-cli db:migrate\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    process.exit(1);
  }
}

dropAutoCreatedTables();

