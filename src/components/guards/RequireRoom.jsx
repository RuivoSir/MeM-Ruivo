import { Navigate, Outlet } from 'react-router-dom'
import { useRoom } from '../../contexts/RoomContext'

export default function RequireRoom() {
  const { currentRoomId, room, membership, isSuperAdmin, loadingRoom } = useRoom()

  if (!currentRoomId) return <Navigate to="/salas" replace />
  if (loadingRoom) return <div className="full-screen-loading">Entrando na sala…</div>
  // Super-admin pode entrar mesmo sem ter um vínculo de membro na sala.
  if (!room || (!membership && !isSuperAdmin)) return <Navigate to="/salas" replace />
  return <Outlet />
}
