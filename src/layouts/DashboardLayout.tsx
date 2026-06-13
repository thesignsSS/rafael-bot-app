import { Outlet } from 'react-router-dom'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { useDashboardLayout } from './hooks/useDashboardLayout'

export function DashboardLayout() {
  const {
    title,
    currentUserProfile,
    user,
    isAdmin,
    handleOpenProfile,
    handleSignOut,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  } = useDashboardLayout()

  return (
    <div className="min-h-screen bg-background text-on-background">
      <DashboardSidebar isMobileOpen={isSidebarOpen} onMobileClose={closeSidebar} />

      <div className="lg:pl-60">
        <DashboardHeader
          title={title}
          currentUserProfile={currentUserProfile}
          user={user}
          isAdmin={isAdmin}
          onOpenProfile={handleOpenProfile}
          onSignOut={handleSignOut}
          onOpenSidebar={openSidebar}
        />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}
