import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'
import Modal from '../components/common/Modal'
import PhotoUpload from '../components/common/PhotoUpload'

const EMPTY = { name: '', info: '', description: '', photo_url: '' }

export default function MapsPage() {
  const { user } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { rows: locations } = useSupabaseRows('locations', 'room_code', currentRoomId, {
    orderBy: 'name',
  })
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  async function handleSave() {
    if (!editing.name.trim()) return
    if (editing.id) {
      const { id, ...data } = editing
      await supabase.from('locations').update(data).eq('id', id)
    } else {
      await supabase.from('locations').insert({
        ...editing,
        room_code: currentRoomId,
        created_by: user.id,
      })
    }
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este local?')) return
    await supabase.from('locations').delete().eq('id', id)
    setViewing(null)
  }

  return (
    <div className="app-page">
      <div className="app-page__header">
        <h1>Maps</h1>
        {isGM && (
          <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })}>
            + Novo local
          </button>
        )}
      </div>

      <div className="card-grid card-grid--wide">
        {locations.map((loc) => (
          <button key={loc.id} className="place-card" onClick={() => setViewing(loc)}>
            <div className="place-card__photo">
              {loc.photo_url ? <img src={loc.photo_url} alt={loc.name} /> : <span>🗺️</span>}
            </div>
            <div className="place-card__body">
              <strong>{loc.name}</strong>
              {loc.info && <span className="muted">{loc.info}</span>}
            </div>
          </button>
        ))}
        {locations.length === 0 && <p className="muted">Nenhum local cadastrado ainda.</p>}
      </div>

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} wide>
          <div className="detail-view">
            {viewing.photo_url && (
              <img
                className="detail-view__photo detail-view__photo--wide"
                src={viewing.photo_url}
                alt={viewing.name}
              />
            )}
            {viewing.info && (
              <p>
                <strong>{viewing.info}</strong>
              </p>
            )}
            {viewing.description && <p className="detail-view__desc">{viewing.description}</p>}
            {isGM && (
              <div className="detail-view__actions">
                <button className="btn-secondary" onClick={() => setEditing(viewing)}>
                  Editar
                </button>
                <button className="btn-link btn-link--danger" onClick={() => handleDelete(viewing.id)}>
                  Excluir
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Editar local' : 'Novo local'}
          onClose={() => setEditing(null)}
          footer={
            <>
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
              path={`rooms/${currentRoomId}/locations`}
              value={editing.photo_url}
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
              shape="wide"
            />
            <label>
              Nome do local
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                autoFocus
              />
            </label>
            <label>
              Informação rápida (endereço, tipo de lugar…)
              <input
                value={editing.info}
                onChange={(e) => setEditing({ ...editing, info: e.target.value })}
              />
            </label>
            <label>
              Descrição
              <textarea
                rows={5}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
