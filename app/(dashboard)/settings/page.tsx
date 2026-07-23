import { SettingsView } from "@/components/dashboard/SettingsView";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsView settings={settings} />;
}
