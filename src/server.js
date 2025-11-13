const app = require("./app")
const { sequelize } = require("../models")

// Authenticate database connection (don't use sync - use migrations instead)
sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection established successfully');
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n⚠️  Remember to run migrations: npx sequelize-cli db:migrate\n');
        });
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err);
        console.error("\nPlease check your database configuration in .env");
        process.exit(1);
    });

