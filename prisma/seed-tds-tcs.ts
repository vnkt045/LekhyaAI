import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function seedTDSSections() {
    console.log('Seeding TDS Sections...');

    const tdsSections = [
        {
            section: '194Q',
            description: 'TDS on purchase of goods',
            thresholdLimit: 5000000, // 50 Lakhs
            rateWithPAN: 0.1,
            rateWithoutPAN: 5.0,
            applicableOn: 'payment'
        },
        {
            section: '194C',
            description: 'TDS on contractor payments',
            thresholdLimit: 30000, // Individual: 30,000, HUF: 1,00,000
            rateWithPAN: 1.0,
            rateWithoutPAN: 20.0,
            applicableOn: 'payment'
        },
        {
            section: '194J',
            description: 'TDS on professional or technical services',
            thresholdLimit: 30000,
            rateWithPAN: 10.0,
            rateWithoutPAN: 20.0,
            applicableOn: 'payment'
        },
        {
            section: '194I',
            description: 'TDS on rent',
            thresholdLimit: 240000, // 2.4 Lakhs per annum
            rateWithPAN: 10.0,
            rateWithoutPAN: 20.0,
            applicableOn: 'payment'
        },
        {
            section: '194H',
            description: 'TDS on commission or brokerage',
            thresholdLimit: 15000,
            rateWithPAN: 5.0,
            rateWithoutPAN: 20.0,
            applicableOn: 'payment'
        },
        {
            section: '194A',
            description: 'TDS on interest other than interest on securities',
            thresholdLimit: 40000, // For individuals: 40,000, Others: 50,000
            rateWithPAN: 10.0,
            rateWithoutPAN: 20.0,
            applicableOn: 'credit'
        }
    ];

    for (const section of tdsSections) {
        await prisma.tDSSection.upsert({
            where: { section: section.section },
            update: section,
            create: section
        });
    }

    console.log(`✓ Seeded ${tdsSections.length} TDS sections`);
}

async function seedTCSConfigs() {
    console.log('Seeding TCS Configurations...');

    const tcsConfigs = [
        {
            goodsType: 'Scrap',
            description: 'Sale of scrap',
            threshold: 250000, // 2.5 Lakhs
            rate: 1.0
        },
        {
            goodsType: 'Minerals',
            description: 'Sale of minerals (coal, lignite, iron ore)',
            threshold: 250000,
            rate: 1.0
        },
        {
            goodsType: 'Timber',
            description: 'Sale of timber obtained under forest lease',
            threshold: 250000,
            rate: 2.5
        },
        {
            goodsType: 'Tendu Leaves',
            description: 'Sale of tendu leaves',
            threshold: 250000,
            rate: 5.0
        },
        {
            goodsType: 'Forest Produce',
            description: 'Sale of forest produce (other than timber and tendu leaves)',
            threshold: 250000,
            rate: 2.5
        },
        {
            goodsType: 'Alcoholic Liquor',
            description: 'Sale of alcoholic liquor for human consumption',
            threshold: 0, // No threshold
            rate: 1.0
        },
        {
            goodsType: 'Motor Vehicle',
            description: 'Sale of motor vehicle exceeding Rs. 10 lakhs',
            threshold: 1000000, // 10 Lakhs
            rate: 1.0
        }
    ];

    for (const config of tcsConfigs) {
        await prisma.tCSConfig.upsert({
            where: { goodsType: config.goodsType },
            update: config,
            create: config
        });
    }

    console.log(`✓ Seeded ${tcsConfigs.length} TCS configurations`);
}

async function main() {
    try {
        await seedTDSSections();
        await seedTCSConfigs();
        console.log('✓ TDS/TCS seed data completed successfully');
    } catch (error) {
        console.error('Error seeding TDS/TCS data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
