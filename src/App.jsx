import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { RoomProvider } from './contexts/RoomContext'
import RequireAuth from './components/guards/RequireAuth'
import RequireRoom from './components/guards/RequireRoom'
import AppShell from './components/shell/AppShell'
import LoginPage from './pages/LoginPage'
import RoomSelectPage from './pages/RoomSelectPage'
import HomePage from './pages/HomePage'
import CharacterSheetPage from './pages/CharacterSheetPage'
import ContactsPage from './pages/ContactsPage'
import MapsPage from './pages/MapsPage'
import NewsAppPage from './pages/NewsAppPage'
import NpcFeedPage from './pages/NpcFeedPage'
import RoomInfoPage from './pages/RoomInfoPage'
import RollLogPage from './pages/RollLogPage'
import MasterScreenPage from './pages/MasterScreenPage'
import MasterScreenSheetPage from './pages/MasterScreenSheetPage'

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <RoomProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<RequireAuth />}>
                <Route path="/salas" element={<RoomSelectPage />} />

                <Route element={<RequireRoom />}>
                  <Route path="/sala" element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="ficha" element={<CharacterSheetPage />} />
                    <Route path="contatos" element={<ContactsPage />} />
                    <Route path="maps" element={<MapsPage />} />
                    <Route path="noticias" element={<NewsAppPage />} />
                    <Route path="noticias/:npcId" element={<NpcFeedPage />} />
                    <Route path="info" element={<RoomInfoPage />} />
                    <Route path="rolagens" element={<RollLogPage />} />
                    <Route path="escudo" element={<MasterScreenPage />} />
                    <Route path="escudo/:sheetId" element={<MasterScreenSheetPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </RoomProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  )
}
