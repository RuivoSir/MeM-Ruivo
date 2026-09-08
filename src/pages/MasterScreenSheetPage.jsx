import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRow } from '../hooks/useSupabaseData'
import { GM_CATEGORIES, blankGmCharacter, computePointsBreakdown } from '../data/mm3e'
import { parseModifier, rollAndLog } from '../utils/dice'
import CharacterSheetEditor from '../components/sheet/CharacterSheetEditor'

function stripRowIds(rows) {
  return (rows || []).map(({ _id, ...rest }) => rest)
}

export default function MasterScreenSheetPage() {
  const { sheetId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { row, loading, error: loadError } = useSupabaseRow('gm_characters', { id: sheetId })
  const [char, setChar] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [lastRoll, setLastRoll] = useState(null)

  useEffect(() => {
    if (row) setChar(row)
    else if (!loading) setChar(blankGmCharacter(currentRoomId, 'npc'))
  }, [row, loading, currentRoomId])

  useEffect(() => {
    if (!lastRoll) return
    const t = setTimeout(() => setLastRoll(null), 6000)
    return () => clearTimeout(t)
  }, [lastRoll])

  async function handleRoll(label, rawModifier) {
    if (!char) return
    const modifier = parseModifier(rawModifier)
    const result = await rollAndLog({
      roomCode: currentRoomId,
      userId: user.id,
      characterName: char.hero_name || profile?.display_name || 'NPC',
      label,
      modifier,
    })
    setLastRoll(result)
  }

  async function handleSave() {
    if (!char) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('gm_characters')
        .update({
          ...char,
          attacks: stripRowIds(char.attacks),
          advantages: stripRowIds(char.advantages),
          powers: stripRowIds(char.powers),
          equipment: stripRowIds(char.equipment),
          points_breakdown: computePointsBreakdown(char),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sheetId)
      if (error) throw error
      setSavedAt(new Date())
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir esta ficha?')) return
    await supabase.from('gm_characters').delete().eq('id', sheetId)
    navigate('/sala/escudo')
  }

  if (!isGM) {
    return <p className="muted">Somente o mestre tem acesso ao Escudo do Mestre.</p>
  }
  if (!char) return <p className="muted">Carregando…</p>

  const category = GM_CATEGORIES.find((c) => c.id === char.category)

  return (
    <div className="sheet-page">
      <button className="btn-link" onClick={() => navigate('/sala/escudo')}>
        ‹ Voltar para o Escudo do Mestre {category && `— ${category.icon} ${category.label}`}
      </button>

      {loadError && (
        <p className="field-error card">Não foi possível conectar ao Supabase ({loadError}).</p>
      )}

      {lastRoll && (
        <div
          className={`roll-toast ${lastRoll.isCritical ? 'roll-toast--crit' : ''} ${
            lastRoll.isFumble ? 'roll-toast--fumble' : ''
          }`}
        >
          🎲 {lastRoll.label}: {lastRoll.die}
          {lastRoll.modifier !== 0 &&
            (lastRoll.modifier > 0 ? ` + ${lastRoll.modifier}` : ` - ${Math.abs(lastRoll.modifier)}`)}{' '}
          = <strong>{lastRoll.total}</strong>
          {lastRoll.isCritical && ' — Crítico!'}
          {lastRoll.isFumble && ' — Falha Crítica'}
        </div>
      )}

      <div className="sheet-toolbar card">
        <label className="sheet-toolbar__select">
          Categoria
          <select
            value={char.category}
            onChange={(e) => setChar({ ...char, category: e.target.value })}
          >
            {GM_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button className="btn-link btn-link--danger" onClick={handleDelete}>
          Excluir
        </button>
        {savedAt && <span className="muted">Salvo às {savedAt.toLocaleTimeString('pt-BR')}</span>}
      </div>

      <CharacterSheetEditor
        character={char}
        onChange={setChar}
        readOnly={false}
        onRoll={handleRoll}
        photoPath={`rooms/${currentRoomId}/gm_characters/${sheetId}`}
      />
    </div>
  )
}
