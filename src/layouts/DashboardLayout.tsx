import { Outlet } from 'react-router-dom'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { useDashboardLayout } from './hooks/useDashboardLayout'

export function DashboardLayout() {
  const { title, user, handleSignOut } = useDashboardLayout()

  return (
    <div className="min-h-screen bg-background text-on-background">
      <DashboardSidebar />

      <div className="lg:pl-60">
        <DashboardHeader title={title} user={user} onSignOut={handleSignOut} />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}
