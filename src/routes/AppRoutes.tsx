import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '../components/auth/GuestRoute'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DashboardLayout } from '../layouts/DashboardLayout'
import CadastroPage from '../pages/cadastro'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import PerfilPage from '../pages/perfil'
import PropostasPage from '../pages/propostas'
import ProposalDetailPage from '../pages/propostas/detail'
import ProposalDocumentsPage from '../pages/propostas/documentos'
import RecuperarSenhaPage from '../pages/recuperar-senha'
import RedefinirSenhaPage from '../pages/redefinir-senha'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth-only — qualquer usuário logado */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/propostas" element={<PropostasPage />} />
          <Route
            path="/propostas/:proposalId/documentos"
            element={<ProposalDocumentsPage />}
          />
          <Route path="/propostas/:proposalId" element={<ProposalDetailPage />} />
        </Route>
      </Route>

      {/*
        Rotas por grupo (fase 2 — descomentar ao criar as páginas):

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['corretor']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/minha-area" element={<CorretorPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
          ...
        </Route>
      */}

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
