import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// Pas deze types aan aan jouw data
export type Team = {
  [x: string]: any;
  id: string;
  name: string;
  founded: number;
  conference: "Eastern" | "Western";
  championships: number;
  imageUrl: string;
};

export const teamsCollection: Collection<Team> = client.db("nba").collection("teams");

export async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Verbonden met MongoDB");
    await loadInitialTeamsData();
    process.on("SIGINT", async () => {
      await client.close();
      console.log("Verbinding met database gesloten");
      process.exit(0);
    });
  } catch (err) {
    console.error("Fout bij verbinden:", err);
  }
}

async function loadInitialTeamsData() {
  const existing = await teamsCollection.countDocuments();
  if (existing === 0) {
    console.log("ℹ️ Geen teams in database – data wordt opgehaald via API...");
    const response = await fetch("https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/teams.json"); // Vervang met jouw fetch-API
    const teams: Team[] = await response.json();
    await teamsCollection.insertMany(teams);
    console.log("✅ Teams succesvol toegevoegd aan database");
  } else {
    console.log("📦 Teams data al aanwezig in MongoDB");
  }
}

// Voor controllers/routes
export async function getAllTeams(): Promise<Team[]> {
  return await teamsCollection.find().toArray();
}

export async function getTeamById(id: string): Promise<Team | null> {
  return await teamsCollection.findOne({ id });
}

export async function updateTeam(id: string, update: Partial<Team>) {
  return await teamsCollection.updateOne({ id }, { $set: update });
}


// arena 

// Vervolg in je database.ts

export type Arena = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  openedYear: number;
  imageUrl: string;
};

export const arenasCollection: Collection<Arena> = client.db("nba").collection("arenas");

export async function getAllArenas(): Promise<Arena[]> {
  return await arenasCollection.find().toArray();
}

export async function getArenaById(id: string): Promise<Arena | null> {
  return await arenasCollection.findOne({ id });
}

export async function updateArena(id: string, update: Partial<Arena>) {
  return await arenasCollection.updateOne({ id }, { $set: update });
}

export async function loadInitialArenas() {
  const count = await arenasCollection.countDocuments();
  if (count === 0) {
    console.log("ℹ️ Arenas niet gevonden in DB – ophalen van GitHub...");
    const res = await fetch("https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/main/arenas.json");
    const arenas: Arena[] = await res.json();
    await arenasCollection.insertMany(arenas);
    console.log("✅ Arenas toegevoegd aan MongoDB");
  }
}
