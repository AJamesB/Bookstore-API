export interface Book {
  id: number; // manually assigned
  title: string;
  author: string;
  genre?: string;
  price?: number;
  createdAt?: string; // ISO date if you want
}

export type BookCreateDTO = Omit<Book, "createdAt">;

export type BookFilter = {
  genre?: string;
  title?: string;
  author?: string;
};

export type DiscountResult = {
  genre: string;
  discount_percentage: number;
  total_discounted_price: number;
};
