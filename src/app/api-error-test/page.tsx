import { ApiErrorTest } from '@/components/api-error-test'

export default function ApiErrorTestPage() {
  return (
    <div className="container mx-auto">
      <ApiErrorTest />
    </div>
  )
}

export const metadata = {
  title: 'API Error Testing - InfyKB',
  description: 'Test API error scenarios and verify logging functionality',
}
