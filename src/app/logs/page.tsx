import { LogsPage } from '@/components/logs-page'

export default function LogsPageRoute() {
  return (
    <div className="container mx-auto">
      <LogsPage />
    </div>
  )
}

export const metadata = {
  title: 'API Logs - InfyKB',
  description: 'Monitor and trace API calls with OpenTelemetry',
}
