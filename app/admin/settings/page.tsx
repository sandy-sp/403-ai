import { SettingsForm } from '@/components/admin/SettingsForm';
import { requireAdmin } from '@/lib/auth';
import { SettingsService } from '@/lib/services/settings.service';

export const metadata = {
  title: 'Site Settings - Admin',
  description: 'Configure site-wide settings and preferences',
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  // Get all settings, initialize defaults if none exist
  let settings;
  try {
    settings = await SettingsService.getAllSettings();
    
    // If no settings exist, initialize defaults
    if (Object.keys(settings).length === 0) {
      await SettingsService.initializeDefaults();
      settings = await SettingsService.getAllSettings();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    // Initialize defaults on error
    await SettingsService.initializeDefaults();
    settings = await SettingsService.getAllSettings();
  }

  return <SettingsForm initialSettings={settings} />;
}