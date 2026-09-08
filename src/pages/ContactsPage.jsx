import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'
import Modal from '../components/common/Modal'
import PhotoUpload from '../components/common/PhotoUpload'

const EMPTY = { name: '', phone: '', description: '', photo_url: '' }

export default function ContactsPage() {
  const { user } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { rows: contacts } = useSupabaseRows('contacts', 'room_code', currentRoomId, {
    orderBy: 'name',
  })
  const [editing, setEditing] = useState(null) // {id?, ...fields} or null
  const [viewing, setViewing] = useState(null)

  async function handleSave() {
    if (!editing.name.trim()) return
    if (editing.id) {
      const { id, ...data } = editing
      await supabase.from('contacts').update(data).eq('id', id)
    } else {
      await supabase.from('contacts').insert({
        ...editing,
        room_code: currentRoomId,
        created_by: user.id,
      })
    }
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este contato?')) return
    await supabase.from('contacts').delete().eq('id', id)
    setViewing(null)
  }

  return (
    <div className="app-page">
      <div className="app-page__header">
        <h1>Contatos</h1>
        {isGM && (
          <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })}>
            + Novo contato
          </button>
        )}
      </div>

      <div className="card-grid">
        {contacts.map((c) => (
          <button key={c.id} className="contact-card" onClick={() => setViewing(c)}>
            <div className="contact-card__photo">
              {c.photo_url ? <img src={c.photo_url} alt={c.name} /> : <span>👤</span>}
            </div>
            <strong>{c.name}</strong>
            {c.phone && <span className="muted">{c.phone}</span>}
          </button>
        ))}
        {contacts.length === 0 && <p className="muted">Nenhum contato cadastrado ainda.</p>}
      </div>

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <div className="detail-view">
            {viewing.photo_url && (
              <img className="detail-view__photo" src={viewing.photo_url} alt={viewing.name} />
            )}
            {viewing.phone && (
              <p>
                <strong>Telefone:</strong> {viewing.phone}
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
          title={editing.id ? 'Editar contato' : 'Novo contato'}
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
              path={`rooms/${currentRoomId}/contacts`}
              value={editing.photo_url}
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
              shape="circle"
            />
            <label>
              Nome
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                autoFocus
              />
            </label>
            <label>
              Telefone
              <input
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
            </label>
            <label>
              Descrição
              <textarea
                rows={4}
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
