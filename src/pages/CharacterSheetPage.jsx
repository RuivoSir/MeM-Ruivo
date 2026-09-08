import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useRoom } from '../contexts/RoomContext'
import { useSupabaseRow, useSupabaseRows } from '../hooks/useSupabaseData'
import { ADVANTAGES, EQUIPMENT_ITEMS, blankCharacter } from '../data/mm3e'
import { parseModifier, rollAndLog } from '../utils/dice'
import AbilitiesGrid from '../components/sheet/AbilitiesGrid'
import DefensesGrid from '../components/sheet/DefensesGrid'
import SkillsEditor from '../components/sheet/SkillsEditor'
import DynamicTable from '../components/sheet/DynamicTable'
import PowersEditor, { totalPowersCost } from '../components/sheet/PowersEditor'
import PhotoUpload from '../components/common/PhotoUpload'

function withRowIds(rows) {
  return (rows || []).map((r, i) => ({ _id: r._id || `row-${i}-${Math.random()}`, ...r }))
}

function stripRowIds(rows) {
  return (rows || []).map(({ _id, ...rest }) => rest)
}

const ATTACK_COLUMNS = [
  { key: 'nome', label: 'Ataque' },
  { key: 'bonus', label: 'Bônus' },
  { key: 'dano', label: 'Dano/Efeito' },
  { key: 'alcance', label: 'Alcance' },
]
const EQUIPMENT_COLUMNS = [
  { key: 'item', label: 'Item', datalist: EQUIPMENT_ITEMS },
  { key: 'custo', label: 'Custo (pontos)' },
]
const ADVANTAGE_COLUMNS = [
  { key: 'nome', label: 'Vantagem', datalist: ADVANTAGES },
  { key: 'detalhes', label: 'Detalhes' },
]

const TABS = [
  { id: 'pessoal', label: 'Pessoal', icon: '🪪' },
  { id: 'habilidades', label: 'Habilidades', icon: '💪' },
  { id: 'defesas', label: 'Defesas', icon: '🛡️' },
  { id: 'pericias', label: 'Perícias', icon: '🎯' },
  { id: 'vantagens', label: 'Vantagens', icon: '🏅' },
  { id: 'poderes', label: 'Poderes', icon: '⚡' },
  { id: 'ofensiva', label: 'Ofensiva', icon: '👊' },
  { id: 'equipamentos', label: 'Equipamentos', icon: '🎒' },
  { id: 'complicacoes', label: 'Complicações', icon: '📝' },
  { id: 'config', label: 'Configuração', icon: '⚙️' },
]

export default function CharacterSheetPage() {
  const { user, profile } = useAuth()
  const { currentRoomId, isGM } = useRoom()
  const { rows: members } = useSupabaseRows('room_members', 'room_code', isGM ? currentRoomId : null)
  const [selectedUid, setSelectedUid] = useState(user.id)
  const { row, error: loadError } = useSupabaseRow('characters', {
    room_code: currentRoomId,
    owner_uid: selectedUid,
  })
  const [char, setChar] = useState(null)
  const [activeTab, setActiveTab] = useState('pessoal')
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

  // Pontos de Habilidades, Defesas, Perícias e Poderes vêm sempre calculados
  // pelas regras do livro — só Vantagens fica a critério de quem edita,
  // porque o custo de cada vantagem varia (Sorte, Contatos, Benefício...).
  const pointsBreakdown = useMemo(() => {
    if (!char) return { abilities: 0, defenses: 0, skills: 0, powers: 0, advantages: 0 }
    const abilities = 2 * Object.values(char.abilities || {}).reduce((s, v) => s + (Number(v) || 0), 0)
    const defenses = Object.values(char.defenses || {}).reduce((s, v) => s + (Number(v) || 0), 0)
    const skills = Math.ceil(
      Object.values(char.skill_ranks || {}).reduce((s, v) => s + (Number(v) || 0), 0) / 2
    )
    const powers = totalPowersCost(char.powers)
    const advantages = Number(char.points_breakdown?.advantages || 0)
    return { abilities, defenses, skills, powers, advantages }
  }, [char])

  const totalPoints =
    pointsBreakdown.abilities + pointsBreakdown.defenses + pointsBreakdown.skills +
    pointsBreakdown.powers + pointsBreakdown.advantages
  const powerBudget = (Number(char?.power_level) || 0) * 15
  const overBudget = totalPoints > powerBudget

  const initiativeTotal = (Number(char?.abilities?.agilidade) || 0) + (Number(char?.initiative) || 0)
  const esquivaCD = 10 + (Number(char?.abilities?.agilidade) || 0) + (Number(char?.defenses?.esquiva) || 0)
  const apararCD = 10 + (Number(char?.abilities?.luta) || 0) + (Number(char?.defenses?.aparar) || 0)

  function set(patch) {
    setChar((c) => ({ ...c, ...patch }))
  }

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
      points_breakdown: pointsBreakdown,
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
        set({
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
        {isGM && members.length > 0 && (
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
        <div
          className={`progress-bar ${overBudget ? 'progress-bar--over' : ''}`}
          title={`${totalPoints} de ${powerBudget} pontos de poder usados`}
        >
          <div
            className="progress-bar__fill"
            style={{ width: `${Math.min(100, (totalPoints / (powerBudget || 1)) * 100)}%` }}
          />
          <span className="progress-bar__label">
            {totalPoints} / {powerBudget} PP
          </span>
        </div>
        {savedAt && <span className="muted">Salvo às {savedAt.toLocaleTimeString('pt-BR')}</span>}
        {!canEdit && <span className="muted">Somente leitura</span>}
      </div>

      <div className="sheet-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sheet-tabs__btn ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pessoal' && (
        <div className="card sheet-section sheet-header">
          <div className="sheet-header__portrait">
            <PhotoUpload
              path={`rooms/${currentRoomId}/characters/${selectedUid}`}
              value={char.photo_url}
              onChange={(url) => set({ photo_url: url })}
              shape="portrait"
              label="foto do herói"
            />
            <div className="hud-badge" title="Nível de Poder">
              <span className="hud-badge__value">{char.power_level}</span>
              <span className="hud-badge__label">Nível</span>
            </div>
          </div>
          <div className="sheet-header__fields">
            <label>
              Herói
              <input
                value={char.hero_name}
                disabled={!canEdit}
                onChange={(e) => set({ hero_name: e.target.value })}
              />
            </label>
            <label>
              Jogador
              <input
                value={char.player_name}
                disabled={!canEdit}
                onChange={(e) => set({ player_name: e.target.value })}
              />
            </label>
            <label>
              Identidade
              <input
                value={char.identity}
                disabled={!canEdit}
                onChange={(e) => set({ identity: e.target.value })}
              />
            </label>
            <label className="sheet-checkbox">
              <input
                type="checkbox"
                checked={!char.secret_identity}
                disabled={!canEdit}
                onChange={(e) => set({ secret_identity: !e.target.checked })}
              />
              Identidade pública
            </label>

            <div className="sheet-header__grid">
              {[
                ['gender', 'Gênero'],
                ['age', 'Idade'],
                ['height', 'Altura'],
                ['weight', 'Peso'],
                ['eyes', 'Olhos'],
                ['hair', 'Cabelo'],
                ['group_name', 'Grupo'],
                ['base_of_operations', 'Base de Operações'],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    value={char[key] || ''}
                    disabled={!canEdit}
                    onChange={(e) => set({ [key]: e.target.value })}
                  />
                </label>
              ))}
              <label>
                Nível de Poder
                <input
                  type="number"
                  value={char.power_level}
                  disabled={!canEdit}
                  onChange={(e) => set({ power_level: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'habilidades' && (
        <div className="card sheet-section">
          <p className="muted">Clique no dado pra rolar um teste da habilidade.</p>
          <AbilitiesGrid
            values={char.abilities}
            onChange={(abilities) => set({ abilities })}
            readOnly={!canEdit}
            onRoll={handleRoll}
          />
        </div>
      )}

      {activeTab === 'defesas' && (
        <div className="card sheet-section">
          <p className="muted">
            Digite as graduações compradas — o total (habilidade + graduação) é calculado sozinho.
          </p>
          <DefensesGrid
            ranks={char.defenses}
            abilities={char.abilities}
            onChange={(defenses) => set({ defenses })}
            readOnly={!canEdit}
          />
        </div>
      )}

      {activeTab === 'pericias' && (
        <div className="card sheet-section">
          <SkillsEditor
            ranks={char.skill_ranks}
            abilities={char.abilities}
            onChange={(skill_ranks) => set({ skill_ranks })}
            readOnly={!canEdit}
            onRoll={handleRoll}
          />
        </div>
      )}

      {activeTab === 'vantagens' && (
        <div className="card sheet-section">
          <DynamicTable
            columns={ADVANTAGE_COLUMNS}
            rows={withRowIds(char.advantages)}
            onChange={(advantages) => set({ advantages })}
            addLabel="Adicionar vantagem"
            readOnly={!canEdit}
          />
        </div>
      )}

      {activeTab === 'poderes' && (
        <div className="card sheet-section">
          <p className="muted">
            Escolha o efeito — o custo por graduação vem direto do livro. Extras somam, Falhas
            subtraem.
          </p>
          <PowersEditor
            powers={withRowIds(char.powers)}
            onChange={(powers) => set({ powers })}
            readOnly={!canEdit}
          />
          <p className="muted">
            Custo total em Poderes: <strong>{pointsBreakdown.powers}</strong> pontos
          </p>
        </div>
      )}

      {activeTab === 'ofensiva' && (
        <div className="card sheet-section">
          <div className="points-row">
            <div className="points-row__total">
              Iniciativa <strong>{initiativeTotal}</strong>
              <button type="button" className="dice-btn" onClick={() => handleRoll('Iniciativa', initiativeTotal)}>
                🎲
              </button>
            </div>
            <span className="muted">
              Defesas Ativas: Esquiva CD {esquivaCD} • Aparar CD {apararCD}
            </span>
          </div>
          <DynamicTable
            columns={ATTACK_COLUMNS}
            rows={withRowIds(char.attacks)}
            onChange={(attacks) => set({ attacks })}
            addLabel="Adicionar ataque"
            readOnly={!canEdit}
            onRoll={handleRoll}
            rollKey="bonus"
            labelKey="nome"
          />
        </div>
      )}

      {activeTab === 'equipamentos' && (
        <div className="card sheet-section">
          <DynamicTable
            columns={EQUIPMENT_COLUMNS}
            rows={withRowIds(char.equipment)}
            onChange={(equipment) => set({ equipment })}
            addLabel="Adicionar item"
            readOnly={!canEdit}
          />
        </div>
      )}

      {activeTab === 'complicacoes' && (
        <div className="card sheet-section">
          <textarea
            className="sheet-textarea"
            rows={6}
            value={char.complications}
            disabled={!canEdit}
            onChange={(e) => set({ complications: e.target.value })}
          />
        </div>
      )}

      {activeTab === 'config' && (
        <div className="card sheet-section">
          <h2>Pontos de Poder</h2>
          <div className="points-row">
            {[
              ['abilities', 'Habilidades'],
              ['defenses', 'Defesas'],
              ['skills', 'Perícias'],
              ['powers', 'Poderes'],
            ].map(([key, label]) => (
              <div key={key}>
                <span className="muted">{label}</span>
                <div>{pointsBreakdown[key]}</div>
              </div>
            ))}
            <label>
              Vantagens
              <input
                type="number"
                value={char.points_breakdown?.advantages ?? 0}
                disabled={!canEdit}
                onChange={(e) =>
                  set({
                    points_breakdown: { ...char.points_breakdown, advantages: Number(e.target.value) },
                  })
                }
              />
            </label>
            <div className="points-row__total">
              Total <strong>{totalPoints}</strong> / {powerBudget}
              {overBudget && <span className="badge badge--danger">Acima do limite</span>}
            </div>
          </div>

          <h2>Outros</h2>
          <div className="points-row">
            <label>
              Pontos Heroicos
              <input
                type="number"
                value={char.hero_points}
                disabled={!canEdit}
                onChange={(e) => set({ hero_points: Number(e.target.value) })}
              />
            </label>
            <label>
              Bônus extra de Iniciativa
              <input
                type="number"
                value={char.initiative}
                disabled={!canEdit}
                onChange={(e) => set({ initiative: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
