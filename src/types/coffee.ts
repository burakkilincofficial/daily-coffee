export interface Member {
  id: string;
  name: string;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Debt {
  id: string;
  memberId: string;
  groupId: string;
  type: "coffee" | "tea" | "meal";
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberWithDebts extends Member {
  debts: Debt[];
  totalDebt: number;
  coffeeDebt: number;
  teaDebt: number;
  mealDebt: number;
}

