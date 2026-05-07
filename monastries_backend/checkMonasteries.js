require('dotenv').config();
const mongoose = require('mongoose');
const Monastery = require('./src/models/monastery');

async function checkMonasteries() {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
        console.log('✅ Connected to database\n');

        const count = await Monastery.countDocuments();
        console.log(`📊 Total monasteries in database: ${count}\n`);

        if (count === 0) {
            console.log('❌ No monasteries found in database!');
            console.log('Run: curl -X POST http://localhost:3777/api/v1/monasteries/seed\n');
        } else {
            const monasteries = await Monastery.find().limit(5);
            console.log('✅ Sample monasteries:');
            monasteries.forEach((m, i) => {
                console.log(`${i + 1}. ${m.name} - ${m.region}`);
                if (m.coordinates) {
                    console.log(`   Coordinates: ${m.coordinates.latitude}, ${m.coordinates.longitude}`);
                } else {
                    console.log(`   ⚠️  No coordinates`);
                }
            });
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkMonasteries();
