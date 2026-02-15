"use client";

import { useState } from "react";
import { z } from "zod";
import { useCoffeeStore } from "@/store/coffee-store";
import { addMemberAction, updateMemberAction, getMembersAction } from "@/app/actions/members";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil } from "lucide-react";
import type { MemberWithDebts } from "@/types/coffee";

const memberSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olabilir")
    .trim()
});

export function MemberManagement() {
  const { members, addMember, updateMember, setMembers } = useCoffeeStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberWithDebts | null>(null);
  const [editMemberName, setEditMemberName] = useState("");

  const handleAddMember = async () => {
    setError(null);

    try {
      const validated = memberSchema.parse({ name: newMemberName });

      const result = await addMemberAction(validated.name);

      if (!result.success) {
        setError(result.error || "Üye eklenirken bir hata oluştu");
        return;
      }

      const membersResult = await getMembersAction();
      if (membersResult.success && membersResult.members) {
        setMembers(membersResult.members);
      }
      setNewMemberName("");
      setIsAddDialogOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message ?? "Geçersiz giriş");
      } else {
        setError("Bir hata oluştu");
      }
    }
  };


  const handleEditMember = async () => {
    if (!editingMember) return;

    setError(null);

    try {
      const validated = memberSchema.parse({ name: editMemberName });

      const result = await updateMemberAction(editingMember.id, validated.name);

      if (!result.success) {
        setError(result.error || "Üye güncellenirken bir hata oluştu");
        return;
      }

      const membersResult = await getMembersAction();
      if (membersResult.success) {
        setMembers(membersResult.members);
      } else {
        updateMember(editingMember.id, validated.name);
      }
      setEditingMember(null);
      setEditMemberName("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message ?? "Geçersiz giriş");
      } else {
        setError("Bir hata oluştu");
      }
    }
  };

  return (
    <>
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Takım Üyeleri</CardTitle>
            <CardDescription className="text-xs">Kahve borcu takip edilecek kişiler</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="text-xs h-8 border-border/60 hover:bg-accent/60"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Üye Ekle
          </Button>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          {members.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground/70 py-4">
              Henüz üye eklenmemiş. İlk üyeyi eklemek için yukarıdaki butona tıklayın.
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs sm:text-sm transition-colors hover:border-border/70"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-foreground/85">{member.name}</span>
                  {member.totalDebt > 0 && (
                    <span className="rounded-md bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 text-[10px] font-medium text-rose-700/70 dark:text-rose-300/70">
                      {member.totalDebt} borç
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setEditMemberName(member.name);
                      setError(null);
                    }}
                    className="rounded-sm p-1 text-muted-foreground/50 hover:text-foreground/70 transition-colors"
                    title="Üyeyi düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Üye Ekle</DialogTitle>
            <DialogDescription>
              Takıma yeni bir üye ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="member-name" className="text-sm font-medium">
                Üye İsmi
              </label>
              <Input
                id="member-name"
                placeholder="Örn: Ahmet"
                value={newMemberName}
                onChange={(e) => {
                  setNewMemberName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddMember();
                  }
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewMemberName("");
                setError(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={handleAddMember}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üyeyi Düzenle</DialogTitle>
            <DialogDescription>
              Üyenin adını güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-member-name" className="text-sm font-medium">
                Yeni İsim
              </label>
              <Input
                id="edit-member-name"
                placeholder="Örn: Ahmet Yılmaz"
                value={editMemberName}
                onChange={(e) => {
                  setEditMemberName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditMember();
                  }
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingMember(null);
                setEditMemberName("");
                setError(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={handleEditMember}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

