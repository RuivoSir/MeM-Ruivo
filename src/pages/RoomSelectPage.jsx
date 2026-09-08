import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'

export default function RoomSelectPage() {
  const { profile, logout } = useAuth()
  const { myRooms, createRoom, joinRoom, selectRoom, isSuperAdmin } = useRoom()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [allRooms, setAllRooms] = useState([])

  useEffect(() => {
    if (!isSuperAdmin) return
    let cancelled = false

    async function load() {
      const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
      if (!cancelled) setAllRooms(data || [])
    }
    load()

    const channel = supabase
      .channel('all-rooms-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [isSuperAdmin])

  function enter(id) {
    selectRoom(id)
    navigate('/sala')
  }

  async function handleJoin(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const id = await joinRoom(code)
      enter(id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const id = await createRoom(newRoomName.trim())
      enter(id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <span>🦸</span>
          <h1>Olá, {profile?.display_name}</h1>
          <p>Escolha uma sala, entre com um código ou crie a sua.</p>
        </div>

        {myRooms.length > 0 && (
          <div className="room-list">
            <h2>Suas salas</h2>
            {myRooms.map((r) => (
              <button key={r.id} className="room-list__item" onClick={() => enter(r.id)}>
                <span>{r.name}</span>
                <span className="room-list__code">{r.id}</span>
                {r.role === 'gm' && <span className="badge badge--gm">Mestre</span>}
              </button>
            ))}
          </div>
        )}

        {isSuperAdmin && (
          <div className="room-list">
            <h2>
              Todas as salas <span className="badge badge--gm">Admin</span>
            </h2>
            {allRooms.length === 0 && <p className="muted">Nenhuma sala criada ainda.</p>}
            {allRooms.map((r) => (
              <button key={r.code} className="room-list__item" onClick={() => enter(r.code)}>
                <span>{r.name}</span>
                <span className="room-list__code">{r.code}</span>
              </button>
            ))}
          </div>
        )}

        <div className="room-actions">
          <form onSubmit={handleJoin} className="auth-form">
            <h2>Entrar com código</h2>
            <label>
              Código da sala
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX: A1B2C3"
                maxLength={8}
                required
              />
            </label>
            <button type="submit" className="btn-secondary" disabled={busy}>
              Entrar na sala
            </button>
          </form>

          <form onSubmit={handleCreate} className="auth-form">
            <h2>Criar nova sala</h2>
            <label>
              Nome da sala
              <input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Ex: Vigilantes de Ruivo City"
              />
            </label>
            <button type="submit" className="btn-primary" disabled={busy}>
              Criar sala (serei o mestre)
            </button>
          </form>
        </div>

        {error && <p className="field-error">{error}</p>}

        <button className="btn-link" onClick={logout} style={{ marginTop: 16 }}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
