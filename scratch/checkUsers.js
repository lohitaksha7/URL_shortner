require('dotenv').config();
const prisma = require('../src/db/prisma');

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });
        console.log("Total Users:", users.length);
        console.log("Users List:", JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
