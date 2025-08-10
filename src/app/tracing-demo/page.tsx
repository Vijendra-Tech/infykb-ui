import { TracingDemo } from '@/components/tracing-demo'

export default function TracingDemoPage() {
  return (
    <div className="container mx-auto">
      <TracingDemo />
    </div>
  )
}

export const metadata = {
  title: 'Tracing Demo - InfyKB',
  description: 'Test OpenTelemetry tracing functionality with various API calls',
}
