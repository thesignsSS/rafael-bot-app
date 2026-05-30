import { ProposalForm } from './components/ProposalForm'
import { useHomePage } from './hooks/useHomePage'

export default function HomePage() {
  useHomePage()

  return (
    <div className="mx-auto max-w-6xl">
      <ProposalForm />
    </div>
  )
}
