import { create } from "zustand";
import type { MemberWithDebts } from "@/types/coffee";

interface CoffeeState {
  members: MemberWithDebts[];
  setMembers: (members: MemberWithDebts[]) => void;
  addMember: (member: MemberWithDebts) => void;
  removeMember: (memberId: string) => void;
  updateMember: (memberId: string, newName: string) => void;
  addDebt: (memberId: string, type: "coffee" | "tea" | "meal", amount: number) => void;
}

export const useCoffeeStore = create<CoffeeState>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    })),
  updateMember: (memberId, newName) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, name: newName } : m
      ),
    })),
  addDebt: (memberId, type, amount) =>
    set((state) => ({
      members: state.members.map((member) => {
        if (member.id !== memberId) return member;

        const newDebt = {
          id: `temp-${Date.now()}`,
          memberId,
          groupId: member.groupId,
          type,
          amount,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedDebts = [...member.debts, newDebt];
        const coffeeDebt = updatedDebts
          .filter((d) => d.type === "coffee")
          .reduce((sum, d) => sum + d.amount, 0);
        const teaDebt = updatedDebts
          .filter((d) => d.type === "tea")
          .reduce((sum, d) => sum + d.amount, 0);
        const mealDebt = updatedDebts
          .filter((d) => d.type === "meal")
          .reduce((sum, d) => sum + d.amount, 0);
        const totalDebt = coffeeDebt + teaDebt + mealDebt;

        return {
          ...member,
          debts: updatedDebts,
          totalDebt,
          coffeeDebt,
          teaDebt,
          mealDebt,
        };
      }),
    })),
}));

