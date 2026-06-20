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
    isDesktopSidebarCollapsed,
    toggleDesktopSidebarCollapse,
  } = useDashboardLayout()

  return (
    <div className="brazuca-page-shell min-h-screen bg-background text-on-background">
      <div className="brazuca-page-decor" aria-hidden="true" />
      <div className="relative z-[1]">
        <DashboardSidebar
          isMobileOpen={isSidebarOpen}
          onMobileClose={closeSidebar}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
          onToggleDesktopCollapse={toggleDesktopSidebarCollapse}
        />

        <div
          className={`relative ${isDesktopSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'}`}
        >
          <DashboardHeader
            title={title}
            currentUserProfile={currentUserProfile}
            user={user}
            isAdmin={isAdmin}
            onOpenProfile={handleOpenProfile}
            onSignOut={handleSignOut}
            onOpenSidebar={openSidebar}
          />

          <main className="dashboard-main-shell min-h-[calc(100vh-4rem)] p-4 sm:p-8">
            <Outlet />
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  )
}
