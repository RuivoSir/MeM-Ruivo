import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'
import { GM_CATEGORIES, blankGmCharacter } from '../data/mm3e'

export default function MasterScreenPage() {
  const navigate = useNavigate()
  const { currentRoomId, isGM } = useRoom()
  const { rows: sheets } = useSupabaseRows('gm_characters', 'room_code', currentRoomId, {
    orderBy: 'created_at',
  })

  if (!isGM) {
    return <p className="muted">Somente o mestre tem acesso ao Escudo do Mestre.</p>
  }

  async function createSheet(category) {
    const { data, error } = await supabase
      .from('gm_characters')
      .insert(blankGmCharacter(currentRoomId, category))
      .select()
      .single()
    if (error) {
      alert('Não foi possível criar: ' + error.message)
      return
    }
    navigate(`/sala/escudo/${data.id}`)
  }

  async function deleteSheet(id) {
    if (!confirm('Excluir esta ficha?')) return
    await supabase.from('gm_characters').delete().eq('id', id)
  }

  return (
    <div className="app-page">
      <div className="app-page__header">
        <div>
          <h1>Escudo do Mestre</h1>
          <p className="muted">Fichas de NPCs, vilões e heróis — só você vê isso.</p>
        </div>
      </div>

      {GM_CATEGORIES.map((cat) => {
        const items = sheets.filter((s) => s.category === cat.id)
        return (
          <div className="card sheet-section" key={cat.id}>
            <div className="app-page__header">
              <h2>
                {cat.icon} {cat.label}
              </h2>
              <button className="btn-primary" onClick={() => createSheet(cat.id)}>
                + Novo
              </button>
            </div>
            <div className="card-grid">
              {items.map((s) => (
                <div key={s.id} className="contact-card">
                  <button
                    className="contact-card__link"
                    onClick={() => navigate(`/sala/escudo/${s.id}`)}
                  >
                    <div className="contact-card__photo">
                      {s.photo_url ? <img src={s.photo_url} alt={s.hero_name} /> : <span>{cat.icon}</span>}
                    </div>
                    <strong>{s.hero_name || 'Sem nome'}</strong>
                    <span className="muted">Nível {s.power_level}</span>
                  </button>
                  <button className="btn-link btn-link--danger" onClick={() => deleteSheet(s.id)}>
                    Excluir
                  </button>
                </div>
              ))}
              {items.length === 0 && <p className="muted">Nenhum aqui ainda.</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
