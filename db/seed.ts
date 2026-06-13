import { getDb } from "../api/queries/connection";

const companies = [
  "Acme Corp", "Globex Industries", "Initech Solutions", "Umbrella Corp",
  "Massive Dynamic", "Stark Industries", "Wayne Enterprises", "Cyberdyne Systems",
  "LexCorp", "Aperture Science", "Hooli", "Pied Piper",
  "Aviato", "Bachmanity", "Raviga Capital", "EndFrame",
] as const;

const names = [
  "Sarah Chen", "Marcus Johnson", "Elena Rodriguez", "David Kim",
  "Amanda Foster", "James Wilson", "Lisa Park", "Robert Martinez",
  "Jennifer Liu", "Michael Brown", "Rachel Green", "Thomas Anderson",
  "Monica Geller", "Chandler Bing", "Joey Tribbiani", "Phoebe Buffay",
] as const;

const statuses = ["NEW", "CONTACTED", "NEGOTIATION", "WON", "LOST"] as const;

function randomPick<T extends readonly unknown[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomValue(0, daysAgo));
  return d;
}

async function seed() {
  const db = getDb();

  const user = await db.user.findFirst();
  if (!user) {
    console.error("No users found. Sign up first, then run: npx tsx db/seed.ts");
    process.exit(1);
  }

  const userId = user.id;
  console.log(`Seeding leads for user ${user.email} (id: ${userId})...`);

  for (let i = 0; i < 24; i++) {
    const name = randomPick(names);
    const company = randomPick(companies);
    const status = randomPick(statuses);
    const value = randomValue(5000, 150000);

    const lead = await db.lead.create({
      data: {
        name: name as string,
        company: company as string,
        email: `${(name as string).toLowerCase().replace(/\s/g, ".")}@${(company as string).toLowerCase().replace(/\s/g, "")}.com`,
        phone: `+1 (${randomValue(200, 999)}) ${randomValue(100, 999)}-${randomValue(1000, 9999)}`,
        status: status as "NEW" | "CONTACTED" | "NEGOTIATION" | "WON" | "LOST",
        value,
        notes: `Initial contact made. ${status === "WON" ? "Deal closed successfully." : status === "LOST" ? "Decided to go with competitor." : "Following up next week."}`,
        userId,
        createdAt: randomDate(90),
        updatedAt: randomDate(30),
      },
    });

    const noteCount = randomValue(1, 3);
    for (let n = 0; n < noteCount; n++) {
      await db.leadNote.create({
        data: {
          content: [
            "Customer requested revised pricing.",
            "Follow-up call scheduled for next week.",
            "Sent proposal via email.",
            "Great initial meeting, very interested.",
            "Need to send case studies.",
            "Decision maker is on vacation until next month.",
          ][randomValue(0, 5)],
          leadId: lead.id,
          createdAt: randomDate(60),
        },
      });
    }

    const taskCount = randomValue(0, 2);
    for (let t = 0; t < taskCount; t++) {
      await db.leadTask.create({
        data: {
          title: [
            "Send follow-up email",
            "Schedule demo call",
            "Prepare proposal",
            "Send pricing sheet",
            "Call back next week",
            "Update CRM notes",
          ][randomValue(0, 5)],
          description: "Auto-generated task from seed data",
          dueDate: randomValue(0, 1) === 0 ? new Date(Date.now() + randomValue(1, 14) * 86400000) : null,
          completed: randomValue(0, 3) === 0,
          leadId: lead.id,
          userId,
          createdAt: randomDate(30),
        },
      });
    }

    await db.activityLog.create({
      data: {
        action: "CREATED",
        entityType: "LEAD",
        entityId: lead.id,
        description: `New lead created: ${name as string} (${company as string})`,
        userId,
        createdAt: randomDate(90),
      },
    });
  }

  console.log("Seed complete! Inserted 24 leads with notes and tasks.");
}

seed().catch(console.error);
