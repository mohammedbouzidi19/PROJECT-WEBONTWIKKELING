import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import { Team, UserModel, Arena } from "./types";
import bcrypt from "bcrypt";

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI!;
const client = new MongoClient(MONGODB_URI);




export const teamsCollection: Collection<Team> = client.db("nba").collection("teams");
export const userCollection: Collection<UserModel> = client.db('login-express').collection<UserModel>('users');
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
  const exist = await teamsCollection.countDocuments();
  if (exist === 0) {
    console.log("ℹ️ Geen teams in database - wachten op data via API...");
    const response = await fetch("https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/teams.json"); 
    const teams: Team[] = await response.json();
    await teamsCollection.insertMany(teams);
    console.log("✅ Teams succesvol toegevoegd aan database");
  } else {
    console.log("📦 Teams data al aanwezig in MongoDB");
  }
}


export async function getAllTeams(): Promise<Team[]> {
  return await teamsCollection.find().toArray();
}

export async function getTeamById(id: string): Promise<Team | null> {
  return await teamsCollection.findOne({ id });
}

export async function updateTeam(id: string, update: Team) {
  return await teamsCollection.updateOne({ id }, { $set: update });
}


// arena 


export const arenasCollection: Collection<Arena> = client.db("nba").collection("arenas");

export async function getAllArenas(): Promise<Arena[]> {
  return await arenasCollection.find().toArray();
}

export async function getArenaById(id: string): Promise<Arena | null> {
  return await arenasCollection.findOne({ id });
}

export async function updateArena(id: string, update: Arena) {
  return await arenasCollection.updateOne({ id }, { $set: update });
}

export async function loadInitialArenas() {
  const count = await arenasCollection.countDocuments();
  if (count === 0) {
    console.log("ℹ️ Arenas niet gevonden in database.");
    const res = await fetch("https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/main/arenas.json");
    const arenas: Arena[] = await res.json();
    await arenasCollection.insertMany(arenas);
    console.log("✅ Arenas toegevoegd aan MongoDB");
  }
}

const saltRounds : number = 10;

export async function login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Username and password required");
    }
    let user : UserModel | null = await userCollection.findOne<UserModel>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}


export async function register(username: string, email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email en wachtwoord vereist!");
    }

    let emailUser: UserModel | null = await userCollection.findOne<UserModel>({ email: email });
    let userName: UserModel | null = await userCollection.findOne<UserModel>({ username: username });

    if (emailUser) {
        throw new Error("Email bestaat al! gebruik een andere mail");
    }
    if (userName) {
        throw new Error("Username bestaat al! kies een andere username");
    }

    await userCollection.insertOne({
        username: username,
        email: email,
        password: await bcrypt.hash(password, saltRounds)
    });

    return;
}