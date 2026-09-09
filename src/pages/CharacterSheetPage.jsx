import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRow, useSupabaseRows } from '../hooks/useSupabaseData'
import { blankCharacter, computePointsBreakdown } from '../data/mm3e'
import { parseModifier, rollAndLog } from '../utils/dice'
import CharacterSheetEditor from '../components/sheet/CharacterSheetEditor'

function stripRowIds(rows) {
  return (rows || []).map(({ _id, ...rest }) => rest)
}

export default function CharacterSheetPage() {
  const { user, profile } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  // Todo mundo pode ver a lista pra escolher de quem ver a ficha — não só o
  // mestre. Só a permissão de EDITAR continua restrita (ver `canEdit`).
  const { rows: members } = useSupabaseRows('room_members', 'room_code', currentRoomId)
  const [selectedUid, setSelectedUid] = useState(user.id)
  const { row, error: loadError } = useSupabaseRow('characters', {
    room_code: currentRoomId,
    owner_uid: selectedUid,
  })
  const [char, setChar] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [lastRoll, setLastRoll] = useState(null)
  const importInputRef = useRef(null)

  useEffect(() => {
    setChar(row ? { ...blankCharacter(currentRoomId, selectedUid), ...row } : blankCharacter(currentRoomId, selectedUid))
  }, [row, currentRoomId, selectedUid])

  useEffect(() => {
    if (!lastRoll) return
    const t = setTimeout(() => setLastRoll(null), 6000)
    return () => clearTimeout(t)
  }, [lastRoll])

  const canEdit = isGM || selectedUid === user.id

  async function handleRoll(label, rawModifier) {
    if (!char) return
    const modifier = parseModifier(rawModifier)
    const result = await rollAndLog({
      roomCode: currentRoomId,
      userId: user.id,
      characterName: char.hero_name || profile?.display_name || 'Alguém',
      label,
      modifier,
    })
    setLastRoll(result)
  }

  function buildSavePayload() {
    return {
      ...char,
      attacks: stripRowIds(char.attacks),
      advantages: stripRowIds(char.advantages),
      powers: stripRowIds(char.powers),
      equipment: stripRowIds(char.equipment),
      points_breakdown: computePointsBreakdown(char),
      room_code: currentRoomId,
      owner_uid: selectedUid,
    }
  }

  async function handleSave() {
    if (!char) return
    setSaving(true)
    try {
      const { error } = await supabase.from('characters').upsert(
        { ...buildSavePayload(), updated_at: new Date().toISOString() },
        { onConflict: 'room_code,owner_uid' }
      )
      if (error) throw error
      setSavedAt(new Date())
    } finally {
      setSaving(false)
    }
  }

  function handleExport() {
    if (!char) return
    const blob = new Blob([JSON.stringify(buildSavePayload(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${char.hero_name || 'ficha'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result))
        setChar({
          ...blankCharacter(currentRoomId, selectedUid),
          ...imported,
          room_code: currentRoomId,
          owner_uid: selectedUid,
        })
      } catch {
        alert('Arquivo inválido — exporte uma ficha deste app pra ter certeza do formato.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (!char) return <p className="muted">Carregando ficha…</p>

  return (
    <div className="sheet-page">
      {loadError && (
        <p className="field-error card">
          Não foi possível conectar ao Supabase ({loadError}). Confira src/supabaseConfig.js e
          as políticas em supabase/schema.sql.
        </p>
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
        {members.length > 1 && (
          <label className="sheet-toolbar__select">
            Ver ficha de
            <select value={selectedUid} onChange={(e) => setSelectedUid(e.target.value)}>
              <option value={user.id}>Minha ficha ({profile?.display_name})</option>
              {members
                .filter((m) => m.user_id !== user.id)
                .map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name}
                  </option>
                ))}
            </select>
          </label>
        )}
        <button className="btn-primary" onClick={handleSave} disabled={saving || !canEdit}>
          {saving ? 'Salvando…' : 'Salvar ficha'}
        </button>
        <button className="btn-secondary" onClick={handleExport}>
          Exportar ficha
        </button>
        {canEdit && (
          <>
            <button className="btn-secondary" onClick={() => importInputRef.current?.click()}>
              Importar ficha
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleImportFile}
            />
          </>
        )}
        {savedAt && <span className="muted">Salvo às {savedAt.toLocaleTimeString('pt-BR')}</span>}
        {!canEdit && <span className="badge badge--gm">Somente leitura</span>}
      </div>

      <CharacterSheetEditor
        character={char}
        onChange={setChar}
        readOnly={!canEdit}
        onRoll={handleRoll}
        photoPath={`rooms/${currentRoomId}/characters/${selectedUid}`}
      />
    </div>
  )
}
