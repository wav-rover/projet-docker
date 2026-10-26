export type Chalet = {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  capacity: number;
};

export type NewChalet = Omit<Chalet, 'id'>;

export type User = { id: number; email: string; roles: string[] };

export type ChaletRepository = {
  findAll: () => Promise<Chalet[]>;
  findById: (id: number) => Promise<Chalet | null>;
  create: (chalet: NewChalet) => Promise<Chalet>;
  remove: (id: number) => Promise<boolean>;
};

export type GetCurrentUser = (token: string) => Promise<User | null>;
