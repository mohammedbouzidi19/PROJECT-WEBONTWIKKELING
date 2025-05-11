
export interface Arena {
    id: string;
    name: string;
    location: string;
    capacity: number;
    openedYear: number;
    imageUrl: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    description: string;
    foundedYear: number;
    isActive: boolean;
    championships: number;
    imageUrl: string;
    conference: string;
    players: string[];
    arena: Arena;
  }
  
  export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
  }