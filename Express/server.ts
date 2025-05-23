import express from 'express';
import dotenv from 'dotenv';
import {  Arena } from '../Terminale app/types';
import {Team, UserModel} from "./types"
import { MongoClient, Collection } from 'mongodb';
import { connectToDatabase, getAllTeams, getTeamById, login, updateTeam } from './database';
import {
  getAllArenas,
  getArenaById,
  updateArena,  loadInitialArenas
} from "./database";
import MongoDBStore from 'connect-mongodb-session';
import { isAuthenticated } from './middleware/secureMiddleware';
import { loginRouter } from "./routes/loginRouter";
import { pageRouter } from "./routes/pageRouter";
import { flashMiddleware } from "./middleware/flashMiddleware";
import e from 'express';
import path from 'path';
import { sessionMiddleware } from './session';
import { connect } from 'http2';



dotenv.config();



const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('port', 3000);
app.use(sessionMiddleware);
app.use(flashMiddleware);


app.use(loginRouter());
app.use(pageRouter());

const client = new MongoClient(process.env.MONGODB_URI as string );
const teamCollection: Collection<Team> = client.db("basketbal").collection("teams");


async function fetchData() {
  const teamsResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/teams.json');
  const arenasResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/arenas.json');
  
  const teamsData: Team[] = await teamsResponse.json();
  const arenasData: Arena[] = await arenasResponse.json();
  
  return { teamsData, arenasData };
}



connectToDatabase();
loadInitialArenas();





app.listen(port, async () => {
  await connect
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
