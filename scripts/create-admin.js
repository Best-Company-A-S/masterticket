const { PrismaClient } = require("../lib/generated/prisma");

async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("Current users:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} (${user.name || "No name"}) - Role: ${
          user.role
        }`
      );
    });

    if (users.length === 0) {
      console.log("No users found. Please create a user first by signing up.");
      return;
    }

    // Make the first user an admin (you can modify this logic)
    const firstUser = users[0];

    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: "admin" },
    });

    console.log(`\n✅ Successfully made ${firstUser.email} an admin!`);
    console.log("You can now access the admin panel at /admin");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
