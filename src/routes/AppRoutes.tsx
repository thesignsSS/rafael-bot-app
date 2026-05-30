import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '../components/auth/GuestRoute'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DashboardLayout } from '../layouts/DashboardLayout'
import CadastroPage from '../pages/cadastro'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import PropostasPage from '../pages/propostas'
import RecuperarSenhaPage from '../pages/recuperar-senha'
import RedefinirSenhaPage from '../pages/redefinir-senha'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/propostas" element={<PropostasPage />} />
        </Route>
      </Route>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      </Route>
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
