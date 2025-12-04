import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Password Hash erzeugen
  const passwordHash = await bcrypt.hash("123456", 10);

  // Users
  await prisma.user.createMany({
    data: [
      { 
        first_name: "Max", 
        last_name: "Muster", 
        email: "max@test.com", 
        passwordHash,
        birth_date: new Date("1990-01-01")
      },
      { 
        first_name: "Anna", 
        last_name: "Schmidt", 
        email: "anna@test.com",
        passwordHash, 
        birth_date: new Date("1994-05-03") 
      },
      { 
        first_name: "Jonas", 
        last_name: "Meier", 
        email: "jonas@test.com",
        passwordHash, 
        birth_date: new Date("1988-10-14") 
      }
    ]
  });

  // Trips
  await prisma.trip.createMany({
    data: [
      {
        user_id: 1,
        type: "angebot",
        from_location: "Berlin",
        to_location: "Hamburg",
        start_date: new Date("2025-03-10T09:00:00Z"),
        is_active: true,
      },
      {
        user_id: 2,
        type: "gesuch",
        from_location: "Köln",
        to_location: "Frankfurt",
        start_date: new Date("2025-04-01T10:00:00Z"),
        is_active: true,
      }
    ]
  });

  console.log("🌱 Done!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
