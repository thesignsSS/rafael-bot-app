import { HomeHeader } from './components/HomeHeader'
import { HomeSidebar } from './components/HomeSidebar'
import { ProposalForm } from './components/ProposalForm'
import { useHomePage } from './hooks/useHomePage'

export default function HomePage() {
  const { user, handleSignOut } = useHomePage()

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-on-surface">
      <HomeSidebar />

      <div className="lg:pl-60">
        <HomeHeader user={user} onSignOut={handleSignOut} />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <ProposalForm />
        </main>

        <footer className="px-4 py-6 text-center text-body-sm text-outline sm:px-8">
          © 2024 Rafael Bot. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
