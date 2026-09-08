import { Link } from 'react-router-dom'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'
import { APPS } from '../data/apps'

export default function HomePage() {
  const { room, currentRoomId, isGM } = useRoom()
  const { rows: members } = useSupabaseRows('room_members', 'room_code', currentRoomId, {
    orderBy: 'joined_at',
  })

  return (
    <div className="feed-page">
      <div className="card feed-hero">
        <h1>{room?.name}</h1>
        <p>
          Código da sala: <strong>{room?.id}</strong> — compartilhe com o grupo para
          entrarem.
        </p>
      </div>

      <div className="card">
        <h2>Aplicativos</h2>
        <div className="quick-links">
          {APPS.filter((app) => !app.gmOnly || isGM).map((app) => (
            <Link key={app.id} to={`/sala/${app.path}`} className="quick-link">
              <span className="quick-link__glyph" style={{ background: app.color }}>
                {app.icon}
              </span>
              {app.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Membros da sala ({members.length})</h2>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.user_id}>
              <span>{m.display_name}</span>
              {m.role === 'gm' && <span className="badge badge--gm">Mestre</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
