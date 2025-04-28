import express from 'express';
import { Team, Arena, SortOptions } from './../Terminale app/interfaces';

const app = express();
const port = 3000;


app.set('view engine', 'ejs');



app.use(express.static('./public'));


async function fetchData() {
  const teamsResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/teams.json');
  const arenasResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/arenas.json');
  
  const teamsData: Team[] = await teamsResponse.json();
  const arenasData: Arena[] = await arenasResponse.json();
  
  return { teamsData, arenasData };
}


app.get('/', (req, res) => {
  res.redirect('/teams');
});

// Teams list
app.get('/teams', async (req, res) => {
  try {
    const { teamsData } = await fetchData();
    
    // Get query parameters
    const nameFilter = (req.query.name as string || '').toLowerCase();
    const sortField = req.query.sort as keyof Team || 'name';
    const sortDirection = req.query.direction as 'asc' | 'desc' || 'asc';
    
    // Filter teams
    let filteredTeams = nameFilter
      ? teamsData.filter(team => team.name.toLowerCase().includes(nameFilter))
      : teamsData;
    
    // Sort teams
    filteredTeams.sort((a, b) => {
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
    
    res.render('teams/index1', { // Changed from '../teams/index' to 'teams/index'
      teams: filteredTeams,
      nameFilter: req.query.name || '',
      sortOptions: { field: sortField, direction: sortDirection } as SortOptions
    });
  } catch (error) {
    res.render('error', { message: 'Failed to load teams' }); // Changed from '../error' to 'error'
  }
});


app.get('/teams/:id', async (req, res) => {
  try {
    const { teamsData } = await fetchData();
    const team = teamsData.find(t => t.id === req.params.id);
    
    if (!team) {
      return res.render('error', { message: 'Team not found' }); // Changed from '../error' to 'error'
    }
    
    res.render('teams/detail1', { team }); // Changed from '../teams/detail' to 'teams/detail'
  } catch (error) {
    res.render('error', { message: 'Failed to load team details' }); // Changed from '../error' to 'error'
  }
});


app.get('/arenas', async (req, res) => {
  try {
    const { arenasData } = await fetchData();
    
    // Get query parameters
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
      sortOptions: { field: sortField, direction: sortDirection } as SortOptions
    });
  } catch (error) {
    res.render('error', { message: 'Failed to load arenas' }); // Changed from '../error' to 'error'
  }
});


app.get('/arenas/:id', async (req, res) => {
  try {
    const { arenasData, teamsData } = await fetchData();
    const arena = arenasData.find(a => a.id === req.params.id);
    
    if (!arena) {
      return res.render('error', { message: 'Arena not found' }); // Changed from '../error' to 'error'
    }
    
    const teamsInArena = teamsData.filter(team => team.arena.id === arena.id);
    res.render('arenas/detail', { arena, teamsInArena }); // Changed from '../arenas/detail' to 'arenas/detail'
  } catch (error) {
    res.render('error', { message: 'Failed to load arena details' }); // Changed from '../error' to 'error'
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;