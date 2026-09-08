import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'
import Modal from '../components/common/Modal'
import PhotoUpload from '../components/common/PhotoUpload'

const EMPTY = { name: '', bio: '', photo_url: '' }

export default function NewsAppPage() {
  const { user } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { rows: npcs } = useSupabaseRows('npcs', 'room_code', currentRoomId, { orderBy: 'name' })
  const [editing, setEditing] = useState(null)

  async function handleSave() {
    if (!editing.name.trim()) return
    if (editing.id) {
      const { id, ...data } = editing
      await supabase.from('npcs').update(data).eq('id', id)
    } else {
      await supabase.from('npcs').insert({
        ...editing,
        room_code: currentRoomId,
        created_by: user.id,
      })
    }
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este NPC e suas notícias?')) return
    await supabase.from('npcs').delete().eq('id', id)
    setEditing(null)
  }

  return (
    <div className="app-page">
      <div className="app-page__header">
        <div>
          <h1>wikiNewsNew</h1>
          <p className="muted">O feed de notícias dos NPCs da sua cidade.</p>
        </div>
        {isGM && (
          <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })}>
            + Novo NPC
          </button>
        )}
      </div>

      <div className="card-grid">
        {npcs.map((npc) => (
          <div key={npc.id} className="npc-card">
            <Link to={`/sala/noticias/${npc.id}`} className="npc-card__link">
              <div className="npc-card__photo">
                {npc.photo_url ? <img src={npc.photo_url} alt={npc.name} /> : <span>🗞️</span>}
              </div>
              <strong>{npc.name}</strong>
              {npc.bio && <span className="muted npc-card__bio">{npc.bio}</span>}
            </Link>
            {isGM && (
              <button className="btn-link" onClick={() => setEditing(npc)}>
                Editar
              </button>
            )}
          </div>
        ))}
        {npcs.length === 0 && <p className="muted">Nenhum NPC publicado ainda.</p>}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar NPC' : 'Novo NPC'}
          onClose={() => setEditing(null)}
          footer={
            <>
              {editing.id && (
                <button className="btn-link btn-link--danger" onClick={() => handleDelete(editing.id)}>
                  Excluir
                </button>
              )}
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Salvar
              </button>
            </>
          }
        >
          <div className="form-grid">
            <PhotoUpload
              path={`rooms/${currentRoomId}/npcs`}
              value={editing.photo_url}
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
              shape="circle"
            />
            <label>
              Nome do NPC
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                autoFocus
              />
            </label>
            <label>
              Bio / cargo
              <textarea
                rows={3}
                value={editing.bio}
                onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
