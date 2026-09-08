import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRow, useSupabaseRows } from '../hooks/useSupabaseData'
import Modal from '../components/common/Modal'
import PhotoUpload from '../components/common/PhotoUpload'

const EMPTY = { title: '', body: '', photo_url: '' }

export default function NpcFeedPage() {
  const { npcId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { row: npc, loading: loadingNpc } = useSupabaseRow('npcs', { id: npcId })
  const { rows: posts } = useSupabaseRows('npc_news', 'npc_id', npcId, {
    orderBy: 'created_at',
    ascending: false,
  })
  const [editing, setEditing] = useState(null)

  async function handleSave() {
    if (!editing.title.trim() && !editing.body.trim()) return
    if (editing.id) {
      const { id, ...data } = editing
      await supabase.from('npc_news').update(data).eq('id', id)
    } else {
      await supabase.from('npc_news').insert({
        ...editing,
        npc_id: npcId,
        room_code: currentRoomId,
        author_uid: user.id,
      })
    }
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta notícia?')) return
    await supabase.from('npc_news').delete().eq('id', id)
  }

  if (loadingNpc) return <p className="muted">Carregando…</p>
  if (!npc) return <p className="muted">NPC não encontrado.</p>

  return (
    <div className="app-page">
      <button className="btn-link" onClick={() => navigate('/sala/noticias')}>
        ‹ Voltar para wikiNewsNew
      </button>

      <div className="npc-profile card">
        <div className="npc-profile__photo">
          {npc.photo_url ? <img src={npc.photo_url} alt={npc.name} /> : <span>🗞️</span>}
        </div>
        <div>
          <h1>{npc.name}</h1>
          {npc.bio && <p className="muted">{npc.bio}</p>}
        </div>
      </div>

      <div className="app-page__header">
        <h2>Publicações</h2>
        {isGM && (
          <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })}>
            + Nova notícia
          </button>
        )}
      </div>

      <div className="news-feed">
        {posts.map((p) => (
          <article key={p.id} className="news-post card">
            <header className="news-post__header">
              <div className="npc-mini-photo">
                {npc.photo_url ? <img src={npc.photo_url} alt={npc.name} /> : <span>🗞️</span>}
              </div>
              <div>
                <strong>{npc.name}</strong>
                {p.created_at && (
                  <div className="muted news-post__date">
                    {new Date(p.created_at).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </header>
            {p.title && <h3>{p.title}</h3>}
            {p.photo_url && <img className="news-post__image" src={p.photo_url} alt={p.title} />}
            {p.body && <p>{p.body}</p>}
            {isGM && (
              <div className="detail-view__actions">
                <button className="btn-link" onClick={() => setEditing(p)}>
                  Editar
                </button>
                <button className="btn-link btn-link--danger" onClick={() => handleDelete(p.id)}>
                  Excluir
                </button>
              </div>
            )}
          </article>
        ))}
        {posts.length === 0 && <p className="muted">Este NPC ainda não publicou nada.</p>}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar notícia' : 'Nova notícia'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Publicar
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label>
              Título
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                autoFocus
              />
            </label>
            <PhotoUpload
              path={`rooms/${currentRoomId}/npcs/${npcId}/news`}
              value={editing.photo_url}
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
              shape="wide"
            />
            <label>
              Texto
              <textarea
                rows={6}
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
