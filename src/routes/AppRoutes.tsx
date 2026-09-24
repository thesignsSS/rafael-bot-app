import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '../components/auth/GuestRoute'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DashboardLayout } from '../layouts/DashboardLayout'
import AdminPage from '../pages/admin'
import AdminWhatsAppPage from '../pages/admin/whatsapp'
import AuthCallbackPage from '../pages/auth-callback'
import CadastroPage from '../pages/cadastro'
import EngenhariaRequestsPage from '../pages/engenharia'
import EngenhariaRequestDetailPage from '../pages/engenharia/detail'
import EngenhariaNovaPage from '../pages/engenharia/nova'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import PerfilPage from '../pages/perfil'
import ConvitesPage from '../pages/propostas/convites'
import PropostasPage from '../pages/propostas'
import ProposalSharePage from '../pages/propostas/compartilhar'
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
          <Route path="/engenharia" element={<EngenhariaRequestsPage />} />
          <Route path="/engenharia/nova" element={<EngenhariaNovaPage />} />
          <Route path="/engenharia/:requestId" element={<EngenhariaRequestDetailPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/convites" element={<ConvitesPage />} />
          <Route path="/propostas" element={<PropostasPage />} />
          <Route
            path="/propostas/compartilhar/:shareToken"
            element={<ProposalSharePage />}
          />
          <Route
            path="/propostas/:proposalId/documentos"
            element={<ProposalDocumentsPage />}
          />
          <Route path="/propostas/:proposalId" element={<ProposalDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      </Route>
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
