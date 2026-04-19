import { PrismaClient } from "@prisma/client";
import { seedDemoData } from "../prisma/seed-demo-data-complete";
import { getPrisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting Voxora AI demo data seeding...");

  const prisma = getPrisma();

  try {
    await seedDemoData(prisma);
    console.log("✅ Demo data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 50 call logs (mix of answered/missed)");
    console.log("  - 20 bookings with ₹45,000 revenue");
    console.log("  - 30 AI processing jobs");
    console.log("  - 40 webhook events");
    console.log("  - Active GROWTH subscription");
    console.log("  - Indian customer names");
    console.log("  - Realistic call transcripts");
    console.log("  - AI analysis with bookings");
    console.log("\n🎯 Dashboard will show:");
    console.log("  - Active subscription with premium features");
    console.log("  - Recent activity timeline");
    console.log("  - Conversion metrics");
    console.log("  - Revenue tracking");
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    process.exit(1);
  }
}

main();

