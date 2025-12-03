export interface Book {
  id: number; // manually assigned
  title: string;
  author: string;
  genre?: string;
  price?: number;
  createdAt?: string; // ISO date if you want
}

export type BookCreateDTO = Omit<Book, "createdAt">; // id is manually assigned, not auto-generated
