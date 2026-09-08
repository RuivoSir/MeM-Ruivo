import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'

export default function RoomInfoPage() {
  const { profile, logout } = useAuth()
  const { room, currentRoomId, isGM, leaveCurrentRoom } = useRoom()
  const { rows: members } = useSupabaseRows('room_members', 'room_code', currentRoomId, {
    orderBy: 'joined_at',
  })
  const [name, setName] = useState('')

  useEffect(() => {
    setName(room?.name || '')
  }, [room?.name])

  async function saveName() {
    if (!name.trim()) return
    await supabase.from('rooms').update({ name: name.trim() }).eq('code', currentRoomId)
  }

  return (
    <div className="app-page">
      <h1>Sala</h1>

      <div className="card sheet-section">
        <h2>{profile?.display_name}</h2>
        <p className="muted">{room?.id ? `Sala atual: ${room.id}` : ''}</p>
      </div>

      <div className="card sheet-section">
        <h2>Código de convite</h2>
        <p className="room-code-display">{room?.id}</p>
        <p className="muted">Compartilhe este código para o grupo entrar na sala.</p>
      </div>

      {isGM && (
        <div className="card sheet-section">
          <h2>Nome da sala</h2>
          <div className="form-grid">
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn-primary" onClick={saveName}>
              Salvar nome
            </button>
          </div>
        </div>
      )}

      <div className="card sheet-section">
        <h2>Membros ({members.length})</h2>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.user_id}>
              <span>{m.display_name}</span>
              {m.role === 'gm' && <span className="badge badge--gm">Mestre</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="card sheet-section">
        <button className="btn-secondary" onClick={leaveCurrentRoom}>
          Trocar de sala
        </button>
        <button className="btn-link btn-link--danger" onClick={logout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
