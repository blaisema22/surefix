require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { pool } = require('./config/db');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function migrateImages() {
    console.log('🚀 Starting image migration script...');
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connected.');

        // --- 1. Migrate Repair Centre Logos ---
        console.log('\n--- Migrating Centre Logos ---');
        const [centres] = await connection.query(
            "SELECT centre_id, logo_url FROM repair_centres WHERE logo_url IS NOT NULL AND logo_url != '' AND logo_url NOT LIKE '%.jpeg'"
        );
        console.log(`Found ${centres.length} logos to migrate.`);

        for (const centre of centres) {
            const oldRelativePath = centre.logo_url;
            const oldAbsolutePath = path.join(__dirname, oldRelativePath);

            try {
                await fs.access(oldAbsolutePath); // Check if file exists

                const newFilename = `${path.parse(oldRelativePath).name}.jpeg`;
                const newRelativePath = path.join('uploads', newFilename).replace(/\\/g, '/');
                const newAbsolutePath = path.join(UPLOADS_DIR, newFilename);

                await sharp(oldAbsolutePath)
                    .resize(500, 500, { fit: 'cover' })
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toFile(newAbsolutePath);

                await connection.query(
                    'UPDATE repair_centres SET logo_url = ? WHERE centre_id = ?',
                    [newRelativePath, centre.centre_id]
                );

                console.log(`  ✅ Migrated logo for centre ${centre.centre_id}: ${oldRelativePath} -> ${newRelativePath}`);

            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`  ⚠️  Skipping logo for centre ${centre.centre_id}: File not found at ${oldRelativePath}`);
                } else {
                    console.error(`  ❌ Error migrating logo for centre ${centre.centre_id}:`, error.message);
                }
            }
        }

        // --- 2. Migrate Appointment Images ---
        console.log('\n--- Migrating Appointment Images ---');
        const [appointments] = await connection.query(
            "SELECT appointment_id, issue_image_url FROM appointments WHERE issue_image_url IS NOT NULL AND issue_image_url != '' AND issue_image_url NOT LIKE '%.jpeg'"
        );
        console.log(`Found ${appointments.length} appointment images to migrate.`);

        for (const appt of appointments) {
            const oldRelativePath = appt.issue_image_url;
            const oldAbsolutePath = path.join(__dirname, oldRelativePath);

            try {
                await fs.access(oldAbsolutePath);

                const newFilename = `${path.parse(oldRelativePath).name}.jpeg`;
                const newRelativePath = path.join('uploads', newFilename).replace(/\\/g, '/');
                const newAbsolutePath = path.join(UPLOADS_DIR, newFilename);

                await sharp(oldAbsolutePath)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toFile(newAbsolutePath);

                await connection.query(
                    'UPDATE appointments SET issue_image_url = ? WHERE appointment_id = ?',
                    [newRelativePath, appt.appointment_id]
                );

                console.log(`  ✅ Migrated image for appointment ${appt.appointment_id}: ${oldRelativePath} -> ${newRelativePath}`);

            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`  ⚠️  Skipping image for appointment ${appt.appointment_id}: File not found at ${oldRelativePath}`);
                } else {
                    console.error(`  ❌ Error migrating image for appointment ${appt.appointment_id}:`, error.message);
                }
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log('NOTE: Old files were not deleted. You can manually clean up non-.jpeg files in the /uploads directory after verifying the migration.');

    } catch (error) {
        console.error('❌ A critical error occurred:', error);
    } finally {
        if (connection) {
            connection.release();
            console.log('Database connection released.');
        }
        await pool.end();
    }
}

migrateImages();