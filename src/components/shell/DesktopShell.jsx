import { NavLink, Outlet } from 'react-router-dom'
import { APPS } from '../../data/apps'
import { useRoom } from '../../contexts/RoomContext'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../common/ThemeToggle'

export default function DesktopShell({ basePath }) {
  const { room, isGM, leaveCurrentRoom } = useRoom()
  const { profile, logout } = useAuth()

  return (
    <div className="desktop">
      <aside className="desktop__sidebar">
        <div className="desktop__logo">
          <span className="desktop__logo-badge">M&M</span>
          <div>
            <strong>{room?.name}</strong>
            <div className="desktop__room-code">Código: {room?.id}</div>
          </div>
        </div>

        <nav className="desktop__nav">
          {APPS.filter((app) => !app.gmOnly || isGM).map((app) => (
            <NavLink
              key={app.id}
              to={`${basePath}/${app.path}`}
              className={({ isActive }) => `desktop__nav-item${isActive ? ' is-active' : ''}`}
            >
              <span className="desktop__nav-glyph" style={{ background: app.color }}>
                {app.icon}
              </span>
              {app.label}
            </NavLink>
          ))}
        </nav>

        <div className="desktop__user">
          <div className="desktop__user-info">
            <strong>{profile?.display_name || 'Herói'}</strong>
            {isGM && <span className="badge badge--gm">Mestre</span>}
            <ThemeToggle className="theme-toggle--inline" />
          </div>
          <div className="desktop__user-actions">
            <button className="btn-link" onClick={leaveCurrentRoom}>
              Trocar de sala
            </button>
            <button className="btn-link btn-link--danger" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="desktop__main">
        <div className="desktop__feed">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
