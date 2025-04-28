import * as readline from 'readline';
import { Team, Arena } from './interfaces';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function fetchData() {
  try {
    const teamsResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/teams.json');
    const arenasResponse = await fetch('https://raw.githubusercontent.com/mohammedbouzidi19/project-JSON/refs/heads/main/arenas.json');
    
    const teams: Team[] = await teamsResponse.json();
    const arenas: Arena[] = await arenasResponse.json();
    
    return { teams, arenas };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { teams: [], arenas: [] };
  }
}

function displayTeam(team: Team) {
  console.log(`\n- ${team.name} (${team.id})`);
  console.log(`  Description: ${team.description}`);
  console.log(`  Founded Year: ${team.foundedYear}`);
  console.log(`  Active: ${team.isActive}`);
  console.log(`  Championships: ${team.championships}`);
  console.log(`  Conference: ${team.conference}`);
  console.log(`  Players: ${team.players.join(', ')}`);
  console.log('\n  Arena Information:');
  console.log(`    Name: ${team.arena.name}`);
  console.log(`    Location: ${team.arena.location}`);
  console.log(`    Capacity: ${team.arena.capacity}`);
  console.log(`    Opened Year: ${team.arena.openedYear}`);
}

function displayArena(arena: Arena) {
  console.log(`\n- ${arena.name} (${arena.id})`);
  console.log(`  Location: ${arena.location}`);
  console.log(`  Capacity: ${arena.capacity}`);
  console.log(`  Opened Year: ${arena.openedYear}`);
}

function displayMenu() {
  console.clear();
  console.log('\nWelcome to the NBA Data Viewer!\n');
  console.log('1. View all data');
  console.log('2. Filter by ID');
  console.log('3. Exit\n');
}

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  const { teams, arenas } = await fetchData();
  
  if (teams.length === 0 || arenas.length === 0) {
    console.log('No data available. Please try again later.');
    rl.close();
    return;
  }

  while (true) {
    displayMenu();
    const choice = await question('Please enter your choice (1-3): ');

    if (choice === '3') {
      console.log('\nThank you for using NBA Data Viewer!');
      rl.close();
      break;
    }

    if (choice === '1') {
      console.log('\nTeams:');
      teams.forEach(team => console.log(`- ${team.name} (${team.id})`));
      
      console.log('\nArenas:');
      arenas.forEach(arena => console.log(`- ${arena.name} (${arena.id})`));
    }

    if (choice === '2') {
      const id = await question('\nPlease enter an ID (e.g., NBA-001 or ARENA-001): ');
      const team = teams.find(t => t.id === id);
      const arena = arenas.find(a => a.id === id);
      
      if (team) {
        displayTeam(team);
      } else if (arena) {
        displayArena(arena);
      } else {
        console.log(`\nNo item found with ID: ${id}`);
      }
    }

    await question('\nPress Enter to continue...');
  }
}

main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
  process.exit(1);
});