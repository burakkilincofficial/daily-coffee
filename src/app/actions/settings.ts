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
 * Kahve fiyatı ayarlarını getir.
 * Eğer yoksa varsayılan 200 TL ile oluştur.
 */
export async function getSettingsAction() {
  try {
    const group = await getOrCreateDefaultGroup();

    let settings = await db.settings.findUnique({
      where: { groupId: group.id },
    });

    if (!settings) {
      settings = await db.settings.create({
        data: {
          groupId: group.id,
          coffeePriceTL: 200,
        },
      });
    }

    return {
      success: true,
      settings: {
        id: settings.id,
        groupId: settings.groupId,
        coffeePriceTL: settings.coffeePriceTL,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    };
  } catch (error) {
    console.error("Ayarlar getirme hatası:", error);
    return {
      success: false,
      error: "Ayarlar getirilirken bir hata oluştu",
      settings: null,
    };
  }
}

/**
 * Kahve fiyatını güncelle
 */
export async function updateCoffeePriceAction(newPrice: number) {
  try {
    if (newPrice <= 0) {
      return { success: false, error: "Fiyat 0'dan büyük olmalıdır" };
    }

    const group = await getOrCreateDefaultGroup();

    const settings = await db.settings.upsert({
      where: { groupId: group.id },
      update: { coffeePriceTL: newPrice },
      create: {
        groupId: group.id,
        coffeePriceTL: newPrice,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      settings: {
        id: settings.id,
        groupId: settings.groupId,
        coffeePriceTL: settings.coffeePriceTL,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    };
  } catch (error) {
    console.error("Fiyat güncelleme hatası:", error);
    return { success: false, error: "Fiyat güncellenirken bir hata oluştu" };
  }
}
