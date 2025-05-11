import express from 'express';
import dotenv from 'dotenv';
import { Team, Arena } from '../Terminale app/types';
import { MongoClient, Collection } from 'mongodb';
import { connectToDatabase, getAllTeams, getTeamById, updateTeam } from './database';

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


// Teams list
connectToDatabase();

// 🌐 Redirect naar teams als startpagina
app.get('/', (req, res) => {
  res.redirect('/teams');
});

// 📄 TEAMS PAGINA — lijst en sortering uit MongoDB
app.get('/teams', async (req, res) => {
  try {
    const teams = await getAllTeams();

    const nameFilter = (req.query.name as string || '').toLowerCase();
    const sortField = req.query.sort as keyof typeof teams[0] || 'name';
    const sortDirection = req.query.direction === 'desc' ? 'desc' : 'asc';

    let filteredTeams = teams.filter(team =>
      team.name.toLowerCase().includes(nameFilter)
    );

    filteredTeams.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
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
    res.render('error', { message: 'Failed to load teams' });
  }
});

// 📄 TEAM DETAIL PAGINA
app.get('/teams/:id', async (req, res) => {
  try {
    const team = await getTeamById(req.params.id);

    if (!team) {
      return res.render('error', { message: 'Team not found' });
    }

    res.render('teams/detail1', { team });
  } catch (error) {
    res.render('error', { message: 'Failed to load team details' });
  }
});

// ✏️ EDIT GET
app.get('/teams/:id/edit', async (req, res) => {
  try { 
    const team = await getTeamById(req.params.id);
    if (!team) return res.render('error', { message: 'Team not found' });

    res.render('teams/edit', { team });
  } catch (error) {
    res.render('error', { message: 'Failed to load team for editing' });
  }
});

// 💾 EDIT POST
app.post('/teams/:id/edit', async (req, res) => {
  try {
    const { name, founded, conference, championships } = req.body;

    await updateTeam(req.params.id, {
      name,
      founded: parseInt(founded),    
      conference,
      championships: parseInt(championships)
    });                                                               

    res.redirect(`/teams/${req.params.id}`);
  } catch (error) {
    res.render('error', { message: 'Failed to update team' });
  }
});

app.get('/arenas', async (req, res) => {
  const { arenasData } = await fetchData();

  const nameFilter = (req.query.name as string || '').toLowerCase();
  const sortField = req.query.sort as keyof Arena || 'name';
  const sortDirection = req.query.direction as 'asc' | 'desc' || 'asc';

  let filteredArenas = nameFilter
    ? arenasData.filter(arena => arena.name.toLowerCase().includes(nameFilter))
    : arenasData;

  filteredArenas.sort((a, b) => {
    const aValue = a[sortField]; 
    const bValue = b[sortField]; 

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
    arenas: filteredArenas,
    nameFilter: req.query.name || '',
    sortOptions: { field: sortField, direction: sortDirection }
  });
});

app.get('/arenas/:id', async (req, res) => {
  const { arenasData, teamsData } = await fetchData();
  const arena = arenasData.find(a => a.id === req.params.id);

  if (!arena) {
    return res.render('error', { message: 'Arena not found' });
  }

  const teamsInArena = teamsData.filter(team => team.arena.id === arena.id);
  res.render('arenas/detail', { arena, teamsInArena });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
