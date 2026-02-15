"use client";

import { useEffect, useState } from "react";
import { useCoffeeStore } from "@/store/coffee-store";
import { MemberManagement } from "@/components/members/member-management";
import { WheelOfFortune } from "@/components/wheel/wheel-of-fortune";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Coffee,
  UtensilsCrossed,
  AlertCircle,
  CupSoda,
  Banknote,
  TrendingUp,
  TrendingDown,
  Settings2,
  Lock,
} from "lucide-react";
import { addDebtAction } from "@/app/actions/debts";
import { drinkCoffeeAction } from "@/app/actions/consumptions";
import { getMembersAction } from "@/app/actions/members";
import { getSettingsAction, updateCoffeePriceAction } from "@/app/actions/settings";
import type { MemberWithDebts, CoffeeSettings } from "@/types/coffee";

interface DashboardClientProps {
  initialMembers: MemberWithDebts[];
  initialSettings: CoffeeSettings | null;
}

export function DashboardClient({
  initialMembers,
  initialSettings,
}: DashboardClientProps) {
  const { members, setMembers, settings, setSettings, addDebt } =
    useCoffeeStore();

  useEffect(() => {
    if (
      members.length !== initialMembers.length ||
      members.some((m, i) => m.id !== initialMembers[i]?.id)
    ) {
      setMembers(initialMembers);
    }
  }, [initialMembers, members, setMembers]);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings, setSettings]);

  const currentMembers = members;
  const coffeePriceTL = settings?.coffeePriceTL ?? 200;

  const [addingDebt, setAddingDebt] = useState<string | null>(null);
  const [drinkingCoffee, setDrinkingCoffee] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [newPrice, setNewPrice] = useState<string>("");

  // Toplam borç (kahve adedi)
  const totalDebtCount = currentMembers.reduce(
    (sum, member) => sum + member.coffeeDebt,
    0
  );

  // Toplam içilen kahve sayısı
  const totalCoffeesDrunk = currentMembers.reduce(
    (sum, member) => sum + member.coffeesDrunk,
    0
  );

  // Toplam toplanan para = toplam borç x fiyat (borç olarak birikmiş para)
  const totalCollectedMoney = totalDebtCount * coffeePriceTL;

  // Toplam harcanan para = toplam içilen kahve x fiyat
  const totalSpentMoney = totalCoffeesDrunk * coffeePriceTL;

  // Mevcut round
  const currentRound =
    currentMembers.length > 0
      ? Math.min(...currentMembers.map((m) => m.coffeesDrunk)) + 1
      : 1;

  const handleAddDebt = async (
    memberId: string,
    type: "coffee" | "tea" | "meal" = "coffee"
  ) => {
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
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Borç ekleme hatası:", error);
    } finally {
      setAddingDebt(null);
    }
  };

  const handleDrinkCoffee = async (memberId: string) => {
    if (drinkingCoffee === memberId) return;

    setDrinkingCoffee(memberId);
    try {
      const result = await drinkCoffeeAction(memberId);

      if (result.success) {
        // Güncel veriyi DB'den çek
        const membersResult = await getMembersAction();
        if (membersResult.success) {
          setMembers(membersResult.members);
        }
      } else if (result.error) {
        setErrorDialog({
          open: true,
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Kahve içme hatası:", error);
    } finally {
      setDrinkingCoffee(null);
    }
  };

  const handleUpdatePrice = async () => {
    const price = parseInt(newPrice, 10);
    if (isNaN(price) || price <= 0) {
      setErrorDialog({
        open: true,
        message: "Geçerli bir fiyat giriniz (0'dan büyük)",
      });
      return;
    }

    const result = await updateCoffeePriceAction(price);
    if (result.success && result.settings) {
      setSettings(result.settings);
      setSettingsDialog(false);
      setNewPrice("");
    } else {
      setErrorDialog({
        open: true,
        message: result.error ?? "Fiyat güncellenemedi",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Özet Kartları */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
                <Banknote className="h-5 w-5 text-amber-700/80 dark:text-amber-300/80" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kahve Fiyatı</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-semibold text-amber-800/90 dark:text-amber-200/90">
                    {coffeePriceTL} TL
                  </p>
                  <button
                    onClick={() => {
                      setNewPrice(String(coffeePriceTL));
                      setSettingsDialog(true);
                    }}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Fiyatı düzenle"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
                <TrendingUp className="h-5 w-5 text-rose-600/70 dark:text-rose-300/70" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Toplam Borç (Toplanacak)
                </p>
                <p className="text-lg font-semibold text-rose-700/85 dark:text-rose-300/85">
                  {totalCollectedMoney.toLocaleString("tr-TR")} TL
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {totalDebtCount} kahve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingDown className="h-5 w-5 text-emerald-600/70 dark:text-emerald-300/70" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Toplam Harcanan
                </p>
                <p className="text-lg font-semibold text-emerald-700/85 dark:text-emerald-300/85">
                  {totalSpentMoney.toLocaleString("tr-TR")} TL
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {totalCoffeesDrunk} kahve içildi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
                <CupSoda className="h-5 w-5 text-slate-600/80 dark:text-slate-300/80" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mevcut Tur</p>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {currentRound}. Tur
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentMembers.filter((m) => m.canDrinkCoffee).length} kişi
                  bekliyor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MemberManagement />
        </div>

        <Card className="lg:col-span-2 shadow-sm border-border/60">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Kahve Takip Panosu
                </CardTitle>
                <CardDescription className="text-sm">
                  Borç ekleyin veya kahve içildiğini kaydedin
                </CardDescription>
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
                    className="flex flex-col rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm"
                  >
                    {/* Üye adı */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-sm text-foreground/90 truncate flex-1">
                        {member.name}
                      </h3>
                    </div>

                    {/* Borç bilgileri */}
                    <div className="flex flex-col gap-1.5 mb-4 min-h-[36px]">
                      {member.totalDebt === 0 && member.coffeesDrunk === 0 ? (
                        <span className="text-muted-foreground/60 text-xs">
                          Henüz kayıt yok
                        </span>
                      ) : (
                        <>
                          {member.coffeeDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800/80 dark:text-amber-300/80 font-medium text-[11px] w-fit">
                              <Coffee className="h-3 w-3" />
                              {member.coffeeDebt} kahve borcu
                            </span>
                          )}
                          {member.teaDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800/80 dark:text-emerald-300/80 font-medium text-[11px] w-fit">
                              <Coffee className="h-3 w-3" />
                              {member.teaDebt} çay
                            </span>
                          )}
                          {member.mealDebt > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/30 text-violet-800/80 dark:text-violet-300/80 font-medium text-[11px] w-fit">
                              <UtensilsCrossed className="h-3 w-3" />
                              {member.mealDebt} yemek
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* İki buton: Kahve Borcu + Kahve İçtim */}
                    <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
                      {/* Kahve Borcu Butonu */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-medium text-rose-600/70 dark:text-rose-400/70">
                          {member.coffeeDebt} borç
                        </span>
                        <Tooltip content="Kahve borcu ekle">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddDebt(member.id, "coffee")}
                            disabled={addingDebt === member.id}
                            className="bg-rose-500/80 hover:bg-rose-500/90 dark:bg-rose-600/50 dark:hover:bg-rose-600/65 text-white shadow-sm hover:shadow transition-all duration-200 h-9 w-full justify-center rounded-lg text-xs font-normal"
                          >
                            <Coffee
                              className={`h-3.5 w-3.5 mr-1.5 ${
                                addingDebt === member.id
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            Borç
                          </Button>
                        </Tooltip>
                      </div>

                      {/* Kahve İçtim Butonu */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70">
                          {member.coffeesDrunk} içti
                        </span>
                        <Tooltip
                          content={
                            member.canDrinkCoffee
                              ? "Kahve içildi olarak kaydet"
                              : "Sıra bu kişide değil - önce herkes bu turu tamamlamalı"
                          }
                        >
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDrinkCoffee(member.id)}
                            disabled={
                              drinkingCoffee === member.id ||
                              !member.canDrinkCoffee
                            }
                            className={`shadow-sm hover:shadow transition-all duration-200 h-9 w-full justify-center rounded-lg text-xs font-normal ${
                              member.canDrinkCoffee
                                ? "bg-emerald-500/80 hover:bg-emerald-500/90 dark:bg-emerald-600/50 dark:hover:bg-emerald-600/65 text-white"
                                : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                            }`}
                          >
                            {member.canDrinkCoffee ? (
                              <CupSoda
                                className={`h-3.5 w-3.5 mr-1.5 ${
                                  drinkingCoffee === member.id
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                            ) : (
                              <Lock className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                            )}
                            İçtim
                          </Button>
                        </Tooltip>
                      </div>
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

      {/* Hata Dialogu */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ open, message: "" })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
                <AlertCircle className="h-5 w-5 text-amber-700/70 dark:text-amber-300/70" />
              </div>
              <div>
                <DialogTitle>Uyarı</DialogTitle>
                <DialogDescription className="mt-1">
                  İşlem gerçekleştirilemedi
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground/90">{errorDialog.message}</p>
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

      {/* Fiyat Ayarları Dialogu */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Kahve Fiyatı Ayarla</DialogTitle>
            <DialogDescription>
              1 kahvenin TL cinsinden fiyatını belirleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="coffee-price" className="text-sm font-medium">
                Fiyat (TL)
              </label>
              <Input
                id="coffee-price"
                type="number"
                min={1}
                placeholder="Örn: 200"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdatePrice();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSettingsDialog(false);
                setNewPrice("");
              }}
            >
              İptal
            </Button>
            <Button onClick={handleUpdatePrice}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
