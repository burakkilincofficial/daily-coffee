import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getMembersAction } from "./actions/members";
import type { MemberWithDebts } from "@/types/coffee";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let members: MemberWithDebts[] = [];
  
  try {
    const membersResult = await getMembersAction();
    members = membersResult.success ? membersResult.members : [];
  } catch (error) {
    console.error("Üyeler getirilemedi:", error);
  }

  return (
    <div className="space-y-6">
      <DashboardClient
        initialMembers={members}
      />
    </div>
  );
}

