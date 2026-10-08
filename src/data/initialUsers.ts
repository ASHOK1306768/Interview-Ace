import { User } from '../types';

// Initial users pool (olpulashok56@gmail.com removed so user can register fresh with custom password)
export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Kanishka',
    email: 'kanishkachourey5@gmail.com',
    password: 'password123',
    role: 'USER',
    createdDate: '08/08/2026'
  },
  {
    id: 'u2',
    name: 'Jaswanth',
    email: 'jaswanthache56@gmail.com',
    password: 'password123',
    role: 'USER',
    createdDate: '08/08/2026'
  }
];
