"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Debt } from "@/types/coffee";

const DEFAULT_GROUP_ID = "default-group";

async function getOrCreateDefaultGroup() {
  try {
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
  } catch (error: any) {
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.log('📦 Database schema bulunamadı, oluşturuluyor...');
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ Database schema oluşturuldu');
        
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
      } catch (pushError) {
        console.error('❌ Database schema oluşturulamadı:', pushError);
        throw new Error('Database schema oluşturulamadı.');
      }
    }
    throw error;
  }
}

export async function addDebtAction(
  memberId: string,
  type: "coffee" | "tea" | "meal" = "coffee",
  amount: number = 1
) {
  try {
    const group = await getOrCreateDefaultGroup();
    
    const member = await db.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, error: "Üye bulunamadı" };
    }

    if (type === "coffee") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayDebts = await db.debt.findMany({
        where: {
          memberId,
          type: "coffee",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (todayDebts.length > 0) {
        return { success: false, error: "Bu kişiye bugün zaten kahve borcu eklenmiş" };
      }
    }

    const debt = await db.debt.create({
      data: {
        memberId,
        groupId: group.id,
        type,
        amount,
      },
    });

    revalidatePath("/");

    return { success: true, debt };
  } catch (error) {
    console.error("Borç ekleme hatası:", error);
    return { success: false, error: "Borç eklenirken bir hata oluştu" };
  }
}

export async function removeDebtAction(debtId: string) {
  try {
    await db.debt.delete({
      where: { id: debtId },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Borç silme hatası:", error);
    return { success: false, error: "Borç silinirken bir hata oluştu" };
  }
}

