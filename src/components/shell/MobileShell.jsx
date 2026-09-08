import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { APPS } from '../../data/apps'
import { useRoom } from '../../contexts/RoomContext'
import { useAuth } from '../../contexts/AuthContext'

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return <span>{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
}

export default function MobileShell({ basePath }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { room, isGM } = useRoom()
  const { profile } = useAuth()

  const isHome = location.pathname === basePath || location.pathname === `${basePath}/`
  const currentApp = APPS.find((a) => location.pathname.startsWith(`${basePath}/${a.path}`))
  const visibleApps = APPS.filter((a) => !a.gmOnly || isGM)

  return (
    <div className="phone">
      <div className="phone__statusbar">
        <Clock />
        <span className="phone__statusbar-room">{room?.name}</span>
        <span>🔋</span>
      </div>

      {isHome ? (
        <div className="phone__home">
          <div className="phone__greeting">
            <p>Olá, {profile?.display_name || 'herói'}</p>
            <p className="phone__room-code">
              Sala <strong>{room?.id}</strong>
              {isGM && <span className="badge badge--gm">Mestre</span>}
            </p>
          </div>
          <div className="app-grid">
            {visibleApps.map((app) => (
              <Link key={app.id} to={`${basePath}/${app.path}`} className="app-icon">
                <span className="app-icon__glyph" style={{ background: app.color }}>
                  {app.icon}
                </span>
                <span className="app-icon__label">{app.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="phone__app">
          <div className="phone__appbar">
            <button className="phone__back" onClick={() => navigate(basePath)} aria-label="Voltar">
              ‹
            </button>
            <span className="phone__appbar-title">{currentApp?.label}</span>
            <span className="phone__appbar-icon">{currentApp?.icon}</span>
          </div>
          <div className="phone__app-content">
            <Outlet />
          </div>
        </div>
      )}

      <div className="phone__home-indicator" onClick={() => navigate(basePath)} />
    </div>
  )
}
