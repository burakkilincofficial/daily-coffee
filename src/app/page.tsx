import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getMembersAction } from "./actions/members";
import { getSettingsAction } from "./actions/settings";
import type { MemberWithDebts, CoffeeSettings } from "@/types/coffee";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let members: MemberWithDebts[] = [];
  let settings: CoffeeSettings | null = null;
  
  try {
    const [membersResult, settingsResult] = await Promise.all([
      getMembersAction(),
      getSettingsAction(),
    ]);
    
    members = membersResult.success ? membersResult.members : [];
    settings = settingsResult.success ? settingsResult.settings : null;
  } catch (error) {
    console.error("Veri getirme hatası:", error);
  }

  return (
    <div className="space-y-6">
      <DashboardClient
        initialMembers={members}
        initialSettings={settings}
      />
    </div>
  );
}

