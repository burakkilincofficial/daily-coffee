import { create } from "zustand";
import type { MemberWithDebts, CoffeeSettings } from "@/types/coffee";

interface CoffeeState {
  members: MemberWithDebts[];
  settings: CoffeeSettings | null;
  setMembers: (members: MemberWithDebts[]) => void;
  setSettings: (settings: CoffeeSettings) => void;
  addMember: (member: MemberWithDebts) => void;
  removeMember: (memberId: string) => void;
  updateMember: (memberId: string, newName: string) => void;
  addDebt: (memberId: string, type: "coffee" | "tea" | "meal", amount: number) => void;
}

/**
 * Round-robin yeniden hesaplama yardımcısı.
 * Members dizisi değiştiğinde canDrinkCoffee değerlerini günceller.
 */
function recalculateRoundRobin(members: MemberWithDebts[]): MemberWithDebts[] {
  if (members.length === 0) return members;

  const minDrinks = Math.min(...members.map((m) => m.coffeesDrunk));
  const currentRound = minDrinks + 1;

  const membersWhoCanDrink = members.filter(
    (m) => m.coffeesDrunk < currentRound
  );
  const zeroDebtWaiting = membersWhoCanDrink.filter(
    (m) => m.coffeeDebt === 0
  );
  const hasZeroDebtWaiting = zeroDebtWaiting.length > 0;

  return members.map((m) => {
    const hasNotDrunkThisRound = m.coffeesDrunk < currentRound;

    let canDrinkCoffee: boolean;
    if (!hasNotDrunkThisRound) {
      canDrinkCoffee = false;
    } else if (hasZeroDebtWaiting) {
      canDrinkCoffee = m.coffeeDebt === 0;
    } else {
      canDrinkCoffee = true;
    }

    return { ...m, canDrinkCoffee };
  });
}

export const useCoffeeStore = create<CoffeeState>((set) => ({
  members: [],
  settings: null,
  setMembers: (members) => set({ members }),
  setSettings: (settings) => set({ settings }),
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
    set((state) => {
      const updatedMembers = state.members.map((member) => {
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
      });

      return { members: recalculateRoundRobin(updatedMembers) };
    }),
}));

