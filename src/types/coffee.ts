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

export interface CoffeeConsumption {
  id: string;
  memberId: string;
  groupId: string;
  round: number;
  createdAt: Date;
}

export interface CoffeeSettings {
  id: string;
  groupId: string;
  coffeePriceTL: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberWithDebts extends Member {
  debts: Debt[];
  totalDebt: number;
  coffeeDebt: number;
  teaDebt: number;
  mealDebt: number;
  /** Toplam kahve içme sayısı */
  coffeesDrunk: number;
  /** Bu kişi şu anda kahve içebilir mi (round-robin) */
  canDrinkCoffee: boolean;
}

