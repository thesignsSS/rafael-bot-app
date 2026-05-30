import { Navigate, Route, Routes } from 'react-router-dom'
import CadastroPage from '../pages/cadastro'
import LoginPage from '../pages/login'
import RecuperarSenhaPage from '../pages/recuperar-senha'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
