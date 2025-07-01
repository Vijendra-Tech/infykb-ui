import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Editor' | 'Admin';

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'Editor',
      setRole: (role) => set({ role }),
    }),
    {
      name: 'role-storage',
    }
  )
);
