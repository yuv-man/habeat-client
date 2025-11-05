import { create } from 'zustand'
import type { IUser } from '../types/interfaces';
import { userAPI } from '../services/api';
interface UserStore {
  user: IUser;
  setUser: (user: IUser) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user: IUser) => set({ user }),
})); 