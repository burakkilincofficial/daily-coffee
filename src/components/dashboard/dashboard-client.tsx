"use client";

import { useEffect, useState } from "react";
import { useCoffeeStore } from "@/store/coffee-store";
import { MemberManagement } from "@/components/members/member-management";
import { WheelOfFortune } from "@/components/wheel/wheel-of-fortune";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Coffee, UtensilsCrossed, AlertCircle } from "lucide-react";
import { addDebtAction } from "@/app/actions/debts";
import { getMembersAction } from "@/app/actions/members";
import type { MemberWithDebts } from "@/types/coffee";

interface DashboardClientProps {
  initialMembers: MemberWithDebts[];
}

export function DashboardClient({
  initialMembers
}: DashboardClientProps) {
  const { 
    members, 
    setMembers,
    addDebt
  } = useCoffeeStore();

  useEffect(() => {
    if (members.length !== initialMembers.length ||
        members.some((m, i) => m.id !== initialMembers[i]?.id)) {
      setMembers(initialMembers);
    }
  }, [initialMembers, members, setMembers]);

  const currentMembers = members;
  const [addingDebt, setAddingDebt] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ""
  });

  const totalDebt = currentMembers.reduce((sum, member) => sum + member.totalDebt, 0);

  const handleAddDebt = async (memberId: string, type: "coffee" | "tea" | "meal" = "coffee") => {
    if (addingDebt === memberId) return;
    
    setAddingDebt(memberId);
    try {
      const result = await addDebtAction(memberId, type, 1);
      
      if (result.success) {
        addDebt(memberId, type, 1);
        
        const membersResult = await getMembersAction();
        if (membersResult.success) {
          setMembers(membersResult.members);
        }
      } else if (result.error) {
        setErrorDialog({
          open: true,
          message: result.error
        });
      }
    } catch (error) {
      console.error("Borç ekleme hatası:", error);
    } finally {
      setAddingDebt(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MemberManagement />
        </div>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Kahve Borçları</CardTitle>
                <CardDescription className="text-sm">
                  Gelmeyenler için kahve borcu ekleyin
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {totalDebt}
                </div>
                <div className="text-xs text-muted-foreground">Toplam Borç</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {currentMembers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-center text-sm text-muted-foreground">
                  Henüz üye eklenmemiş. Üye ekleyip başlayın.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-base truncate flex-1">{member.name}</h3>
                    </div>
                    
                    <div className="flex flex-col gap-2 mb-4 min-h-[60px]">
                      {member.totalDebt === 0 ? (
                        <span className="text-muted-foreground text-xs">Borç yok</span>
                      ) : (
                        <>
                          {member.coffeeDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium text-xs w-fit">
                              <Coffee className="h-3.5 w-3.5" />
                              {member.coffeeDebt} kahve
                            </span>
                          )}
                          {member.teaDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium text-xs w-fit">
                              <Coffee className="h-3.5 w-3.5" />
                              {member.teaDebt} çay
                            </span>
                          )}
                          {member.mealDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium text-xs w-fit">
                              <UtensilsCrossed className="h-3.5 w-3.5" />
                              {member.mealDebt} yemek
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border">
                      <Tooltip content="Kahve borcu ekle">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAddDebt(member.id, "coffee")}
                          disabled={addingDebt === member.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-12 w-full justify-center rounded-lg"
                        >
                          <Coffee 
                            className={`h-6 w-6 ${addingDebt === member.id ? 'animate-spin' : 'animate-bounce'}`} 
                          />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <WheelOfFortune members={currentMembers} />
      </section>

      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ open, message: "" })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <DialogTitle>Uyarı</DialogTitle>
                <DialogDescription className="mt-1">
                  Kahve cezası eklenemedi
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground">
              {errorDialog.message}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setErrorDialog({ open: false, message: "" })}
              className="w-full sm:w-auto"
            >
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

