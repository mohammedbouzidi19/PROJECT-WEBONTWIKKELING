import express, { Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/secureMiddleware";
import { getAllArenas, getAllTeams, getArenaById, getTeamById, updateArena, updateTeam } from "../database";
import { Team , Arena} from "../types";
import { ObjectId } from "mongodb";


export function pageRouter() {
    const router = express.Router();

    

    router.get("/", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

     router.get("/home", isAuthenticated, async (req: Request, res: Response) => {
    try {
        res.render("home", {
            currentPage: 'home',
            title: 'home',
            user: req.session.user
        });
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Internal Server Error');
    }
});


 
    
    router.get('/teams' , async (req, res) => {
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
    
    
    router.get('/teams/:id', async (req, res) => {
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
    
    
    router.get('/teams/:id/edit', async (req, res) => {
      try { 
        const team = await getTeamById(req.params.id);
        if (!team) return res.render('error', { message: 'Team niet gevonden' });
    
        res.render('teams/edit', { team });
      } catch (error) {
        res.render('error', { message: 'fout bij het laden van teams om te editen' });
      }
    });
    
    
    router.post('/teams/:id/edit', async (req, res) => {
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
    router.get('/arenas', async (req, res) => {
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
    
    
    router.get('/arenas/:id', async (req, res) => {
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
    
    
    router.get('/arenas/:id/edit', async (req, res) => {
      const arena = await getArenaById(req.params.id);
      if (!arena) return res.render('error', { message: 'Arena niet gevonden' });
    
      res.render('arenas/edit', { arena });
    });
    
    
    router.post('/arenas/:id/edit', async (req, res) => {
      const { name, location, capacity, openedYear } = req.body;
    
      await updateArena(req.params.id, {
        name,
        location,
        capacity: parseInt(capacity),
        openedYear: parseInt(openedYear)
      });
    
      res.redirect(`/arenas/${req.params.id}`);
    });
    
    return router;
}