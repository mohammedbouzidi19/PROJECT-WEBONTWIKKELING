import express from 'express';
import dotenv from 'dotenv';
import {  Arena } from '../Terminale app/types';
import {Team} from "./database"
import { MongoClient, Collection } from 'mongodb';
import { connectToDatabase, getAllTeams, getTeamById, updateTeam } from './database';
import {
  getAllArenas,
  getArenaById,
  updateArena,  loadInitialArenas
} from "./database";

dotenv.config();



const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

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


app.get('/', (req, res) => {
  res.redirect('/teams');
});


app.get('/teams', async (req, res) => {
  try {
    const teams = await getAllTeams();

    const nameFilter = (req.query.name as string || '').toLowerCase();
    const sortField = req.query.sort as keyof typeof teams[0] || 'name';
    const sortDirection = req.query.direction === 'desc' ? 'desc' : 'asc';

    let filteredTeams = teams.filter(team =>
      team.name.toLowerCase().includes(nameFilter)
    );

    filteredTeams.sort((teamA, teamB) => {
      const aValue = teamA[sortField];
      const bValue = teamB[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    res.render('teams/index1', {
      teams: filteredTeams,
      nameFilter: req.query.name || '',
      sortOptions: { field: sortField, direction: sortDirection }
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Fout bij het laden van teams' });
  }
});


app.get('/teams/:id', async (req, res) => {
  try {
    const team = await getTeamById(req.params.id);

    if (!team) {
      return res.render('error', { message: 'Team niet gevonden' });
    }

    res.render('teams/detail1', { team });
  } catch (error) {
    res.render('error', { message: 'Fout bij het laden van teams' });
  }
});


app.get('/teams/:id/edit', async (req, res) => {
  try { 
    const team = await getTeamById(req.params.id);
    if (!team) return res.render('error', { message: 'Team niet gevonden' });

    res.render('teams/edit', { team });
  } catch (error) {
    res.render('error', { message: 'fout bij het laden van teams om te editen' });
  }
});


app.post('/teams/:id/edit', async (req, res) => {
  try {
    const { name, founded, conference, championships } = req.body;
    const newData : Team = {
      name,
      foundedYear: parseInt(founded),
      conference: "Eastern",
      championships: parseInt(championships)
    }
    await updateTeam(req.params.id, newData);                                                               

    res.redirect(`/teams/${req.params.id}`);
  } catch (error) {
    res.render('error', { message: 'Fout om team up te daten' });
  }
});




// arenas
app.get('/arenas', async (req, res) => {
  const arenas = await getAllArenas();

  const nameFilter = (req.query.name as string || '').toLowerCase();
  const sortField = req.query.sort as keyof Arena || 'name';
  const sortDirection = req.query.direction === 'desc' ? 'desc' : 'asc';

  let filtered = arenas.filter(a =>
    a.name.toLowerCase().includes(nameFilter)
  );

  filtered.sort((arenaA, arenaB) => {
    const aValue = arenaA[sortField];
    const bValue = arenaB[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  res.render('arenas/index', {
    arenas: filtered,
    nameFilter,
    sortOptions: { field: sortField, direction: sortDirection }
  });
});


app.get('/arenas/:id', async (req, res) => {
  try {
      const arena = await getArenaById(req.params.id);
   
    if (!arena) {
      return res.render('error', { message: 'Arena niet gevonden' });
    }

    

    res.render('arenas/detail', { arena,  });
  } catch (error) {
    res.render('error', { message: 'Fout bij het laden van de arena' });
  }
});


app.get('/arenas/:id/edit', async (req, res) => {
  const arena = await getArenaById(req.params.id);
  if (!arena) return res.render('error', { message: 'Arena niet gevonden' });

  res.render('arenas/edit', { arena });
});


app.post('/arenas/:id/edit', async (req, res) => {
  const { name, location, capacity, openedYear } = req.body;

  await updateArena(req.params.id, {
    name,
    location,
    capacity: parseInt(capacity),
    openedYear: parseInt(openedYear)
  });

  res.redirect(`/arenas/${req.params.id}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
