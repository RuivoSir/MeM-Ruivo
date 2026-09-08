import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRows } from '../hooks/useSupabaseData'

export default function RollLogPage() {
  const { currentRoomId, isGM } = useRoom()
  const { rows: rolls } = useSupabaseRows('dice_rolls', 'room_code', currentRoomId, {
    orderBy: 'created_at',
    ascending: false,
  })

  if (!isGM) {
    return <p className="muted">Somente o mestre pode ver o log de rolagens.</p>
  }

  return (
    <div className="app-page">
      <div className="app-page__header">
        <div>
          <h1>Rolagens</h1>
          <p className="muted">Tudo que o grupo rolou nesta sala — só você vê isso.</p>
        </div>
      </div>

      <div className="roll-log">
        {rolls.map((r) => (
          <div
            key={r.id}
            className={`roll-log__row ${r.is_critical ? 'roll-log__row--crit' : ''} ${
              r.is_fumble ? 'roll-log__row--fumble' : ''
            }`}
          >
            <div className="roll-log__who">
              <strong>{r.character_name || 'Alguém'}</strong>
              {r.label && <span className="muted"> — {r.label}</span>}
            </div>
            <div className="roll-log__math">
              <span className="roll-log__die">🎲{r.die_result}</span>
              {r.modifier !== 0 && (
                <span className="muted">
                  {r.modifier > 0 ? ` + ${r.modifier}` : ` - ${Math.abs(r.modifier)}`}
                </span>
              )}
              <span className="roll-log__total">= {r.total}</span>
              {r.is_critical && <span className="badge badge--gm">Crítico!</span>}
              {r.is_fumble && <span className="badge badge--danger">Falha Crítica</span>}
            </div>
            <div className="muted roll-log__time">
              {r.created_at && new Date(r.created_at).toLocaleTimeString('pt-BR')}
            </div>
          </div>
        ))}
        {rolls.length === 0 && <p className="muted">Ninguém rolou nada ainda nesta sala.</p>}
      </div>
    </div>
  )
}
