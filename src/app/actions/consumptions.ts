"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const DEFAULT_GROUP_ID = "default-group";

async function getOrCreateDefaultGroup() {
  let group = await db.group.findFirst();

  if (!group) {
    group = await db.group.create({
      data: {
        id: DEFAULT_GROUP_ID,
        name: "Daily Coffee Grubu",
      },
    });
  }

  return group;
}

/**
 * Round-robin algoritması:
 * 1. Her üyenin toplam kahve içme sayısına bak
 * 2. Mevcut round = min(tüm üyelerin içme sayısı) + 1
 * 3. Bir üye kahve içebilir eğer: üyenin içme sayısı < mevcut round
 *
 * Öncelik kuralı:
 * - Bir round içinde, borcu 0 olan (veya en az borcu olan) kişiler önce içer
 * - Borçsuz herkes içtikten sonra diğerleri de içebilir
 */
export async function calculateRoundRobin(groupId: string) {
  const members = await db.member.findMany({
    where: { groupId },
    include: {
      consumptions: true,
      debts: {
        where: { type: "coffee" },
      },
    },
  });

  if (members.length === 0) {
    return { currentRound: 1, memberStates: [] };
  }

  // Her üyenin toplam içme sayısı
  const memberDrinkCounts = members.map((m) => ({
    memberId: m.id,
    drinkCount: m.consumptions.length,
    coffeeDebt: m.debts.reduce((sum, d) => sum + d.amount, 0),
  }));

  // Mevcut round = en az içen kişinin sayısı + 1
  const minDrinks = Math.min(...memberDrinkCounts.map((m) => m.drinkCount));
  const currentRound = minDrinks + 1;

  // Bu roundda henüz içmemiş üyeler
  const membersWhoCanDrink = memberDrinkCounts.filter(
    (m) => m.drinkCount < currentRound
  );

  // Öncelik: borcu 0 olan üyeler var mı bu roundda?
  const zeroDebtWaiting = membersWhoCanDrink.filter(
    (m) => m.coffeeDebt === 0
  );

  // Eğer borçsuz bekleyen üye varsa, sadece onlar içebilir
  // Eğer tüm borçsuzlar zaten içtiyse, herkes içebilir
  const hasZeroDebtWaiting = zeroDebtWaiting.length > 0;

  const memberStates = memberDrinkCounts.map((m) => {
    const hasNotDrunkThisRound = m.drinkCount < currentRound;

    let canDrink: boolean;
    if (!hasNotDrunkThisRound) {
      // Bu roundda zaten içmiş
      canDrink = false;
    } else if (hasZeroDebtWaiting) {
      // Borçsuz bekleyen var → sadece borçsuzlar içebilir
      canDrink = m.coffeeDebt === 0;
    } else {
      // Borçsuz kimse kalmadı → herkes içebilir
      canDrink = true;
    }

    return {
      memberId: m.memberId,
      drinkCount: m.drinkCount,
      coffeeDebt: m.coffeeDebt,
      canDrink,
      currentRound,
    };
  });

  return { currentRound, memberStates };
}

/**
 * Kahve içme kaydı ekle (round-robin kontrolüyle)
 */
export async function drinkCoffeeAction(memberId: string) {
  try {
    const group = await getOrCreateDefaultGroup();

    const member = await db.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, error: "Üye bulunamadı" };
    }

    // Round-robin kontrolü
    const { memberStates } = await calculateRoundRobin(group.id);
    const memberState = memberStates.find((m) => m.memberId === memberId);

    if (!memberState?.canDrink) {
      return {
        success: false,
        error:
          "Sıra bu kişide değil! Önce herkes bu turdaki kahvesini içmeli.",
      };
    }

    // Yeni round hesapla
    const memberConsumptions = await db.coffeeConsumption.count({
      where: { memberId },
    });
    const newRound = memberConsumptions + 1;

    // Kahve içme kaydı oluştur
    const consumption = await db.coffeeConsumption.create({
      data: {
        memberId,
        groupId: group.id,
        round: newRound,
      },
    });

    revalidatePath("/");

    return { success: true, consumption };
  } catch (error) {
    console.error("Kahve içme kaydı hatası:", error);
    return {
      success: false,
      error: "Kahve içme kaydı eklenirken bir hata oluştu",
    };
  }
}

/**
 * Toplam kahve içme istatistiklerini getir
 */
export async function getConsumptionStatsAction() {
  try {
    const group = await getOrCreateDefaultGroup();

    const totalConsumptions = await db.coffeeConsumption.count({
      where: { groupId: group.id },
    });

    const { currentRound, memberStates } = await calculateRoundRobin(
      group.id
    );

    return {
      success: true,
      stats: {
        totalConsumptions,
        currentRound,
        memberStates,
      },
    };
  } catch (error) {
    console.error("İstatistik hatası:", error);
    return {
      success: false,
      error: "İstatistikler getirilirken bir hata oluştu",
      stats: null,
    };
  }
}
