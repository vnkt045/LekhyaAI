import { db } from './src/lib/db'

async function main() {
    try {
        const count = await db.company.count()
        console.log('Company count:', count)
        console.log('Database connection successful')
    } catch (e) {
        console.error('Database connection failed:', e)
    }
}

main()
