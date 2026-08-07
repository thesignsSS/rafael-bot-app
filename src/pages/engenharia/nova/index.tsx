import { EngenhariaForm } from './components/EngenhariaForm'
import { useEngenhariaPage } from './hooks/useEngenhariaPage'

export default function EngenhariaPage() {
  useEngenhariaPage()

  return (
    <div className="mx-auto max-w-6xl">
      <EngenhariaForm />
    </div>
  )
}
