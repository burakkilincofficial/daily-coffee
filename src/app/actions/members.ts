"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Member, MemberWithDebts } from "@/types/coffee";

const memberSchema = z.object({
  name: z.string().min(1, "İsim gereklidir").max(50, "İsim çok uzun"),
});

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
        throw new Error('Database schema oluşturulamadı. Lütfen manuel olarak "npx prisma db push" çalıştırın.');
      }
    }
    throw error;
  }
}

export async function addMemberAction(name: string) {
  try {
    const validated = memberSchema.parse({ name });
    
    const group = await getOrCreateDefaultGroup();
    
    const member = await db.member.create({
      data: {
        name: validated.name.trim(),
        groupId: group.id,
      },
    });

    revalidatePath("/");
    
    return { success: true, member };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Bu isimde bir üye zaten var" };
    }
    
    console.error("Üye ekleme hatası:", error);
    return { success: false, error: "Üye eklenirken bir hata oluştu" };
  }
}

export async function removeMemberAction(memberId: string) {
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
    });
    
    if (!member) {
      return { success: false, error: "Üye bulunamadı" };
    }
    
    await db.member.delete({
      where: { id: memberId },
    });
    
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Üye silme hatası:", error);
    return { success: false, error: "Üye silinirken bir hata oluştu" };
  }
}

export async function updateMemberAction(memberId: string, newName: string) {
  try {
    const validated = memberSchema.parse({ name: newName });
    
    const member = await db.member.findUnique({
      where: { id: memberId },
    });
    
    if (!member) {
      return { success: false, error: "Üye bulunamadı" };
    }
    
    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: {
        name: validated.name.trim(),
      },
    });
    
    revalidatePath("/");
    
    return { success: true, member: updatedMember };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Bu isimde bir üye zaten var" };
    }
    console.error("Üye güncelleme hatası:", error);
    return { success: false, error: "Üye güncellenirken bir hata oluştu" };
  }
}

export async function getMembersAction() {
  try {
    const group = await getOrCreateDefaultGroup();

    const members = await db.member.findMany({
      where: { groupId: group.id },
      include: {
        debts: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const membersWithDebts: MemberWithDebts[] = members.map((member) => {
      const coffeeDebt = member.debts
        .filter((d) => d.type === "coffee")
        .reduce((sum, d) => sum + d.amount, 0);
      const teaDebt = member.debts
        .filter((d) => d.type === "tea")
        .reduce((sum, d) => sum + d.amount, 0);
      const mealDebt = member.debts
        .filter((d) => d.type === "meal")
        .reduce((sum, d) => sum + d.amount, 0);
      const totalDebt = coffeeDebt + teaDebt + mealDebt;

      return {
        id: member.id,
        name: member.name,
        groupId: member.groupId,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        debts: member.debts.map((debt) => ({
          id: debt.id,
          memberId: debt.memberId,
          groupId: debt.groupId,
          type: debt.type as "coffee" | "tea" | "meal",
          amount: debt.amount,
          createdAt: debt.createdAt,
          updatedAt: debt.updatedAt,
        })),
        totalDebt,
        coffeeDebt,
        teaDebt,
        mealDebt,
      };
    });

    return { success: true, members: membersWithDebts };
  } catch (error) {
    console.error("Üyeleri getirme hatası:", error);
    return { success: false, error: "Üyeler getirilirken bir hata oluştu", members: [] };
  }
}

