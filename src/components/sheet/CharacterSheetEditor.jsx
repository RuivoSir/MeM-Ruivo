import { useState } from 'react'
import { ADVANTAGES, EQUIPMENT_ITEMS, computePointsBreakdown } from '../../data/mm3e'
import AbilitiesGrid from './AbilitiesGrid'
import DefensesGrid from './DefensesGrid'
import SkillsEditor from './SkillsEditor'
import DynamicTable from './DynamicTable'
import PowersEditor from './PowersEditor'
import PhotoUpload from '../common/PhotoUpload'

function withRowIds(rows) {
  return (rows || []).map((r, i) => ({ _id: r._id || `row-${i}-${Math.random()}`, ...r }))
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

// Corpo completo de uma ficha (abas + todas as seções): usado tanto pela
// Ficha do jogador quanto pelo Escudo do Mestre (NPCs/vilões/heróis) — os
// dois só diferem em onde os dados são salvos, não em como são editados.
export default function CharacterSheetEditor({ character, onChange, readOnly, onRoll, photoPath }) {
  const [activeTab, setActiveTab] = useState('pessoal')
  const char = character

  const pointsBreakdown = computePointsBreakdown(char)
  const totalPoints =
    pointsBreakdown.abilities + pointsBreakdown.defenses + pointsBreakdown.skills +
    pointsBreakdown.powers + pointsBreakdown.advantages
  const powerBudget = (Number(char.power_level) || 0) * 15
  const overBudget = totalPoints > powerBudget

  const initiativeTotal = (Number(char.abilities?.agilidade) || 0) + (Number(char.initiative) || 0)
  const esquivaCD = 10 + (Number(char.abilities?.agilidade) || 0) + (Number(char.defenses?.esquiva) || 0)
  const apararCD = 10 + (Number(char.abilities?.luta) || 0) + (Number(char.defenses?.aparar) || 0)

  function set(patch) {
    onChange({ ...char, ...patch })
  }

  return (
    <>
      <div className="sheet-status-row">
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
        {readOnly && <span className="muted">Somente leitura</span>}
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
              path={photoPath}
              value={char.photo_url}
              onChange={(url) => set({ photo_url: url })}
              shape="portrait"
              label="foto"
            />
            <div className="hud-badge" title="Nível de Poder">
              <span className="hud-badge__value">{char.power_level}</span>
              <span className="hud-badge__label">Nível</span>
            </div>
          </div>
          <div className="sheet-header__fields">
            <label>
              Nome
              <input
                value={char.hero_name}
                disabled={readOnly}
                onChange={(e) => set({ hero_name: e.target.value })}
              />
            </label>
            <label>
              Jogador
              <input
                value={char.player_name}
                disabled={readOnly}
                onChange={(e) => set({ player_name: e.target.value })}
              />
            </label>
            <label>
              Identidade
              <input
                value={char.identity}
                disabled={readOnly}
                onChange={(e) => set({ identity: e.target.value })}
              />
            </label>
            <label className="sheet-checkbox">
              <input
                type="checkbox"
                checked={!char.secret_identity}
                disabled={readOnly}
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
                    disabled={readOnly}
                    onChange={(e) => set({ [key]: e.target.value })}
                  />
                </label>
              ))}
              <label>
                Nível de Poder
                <input
                  type="number"
                  value={char.power_level}
                  disabled={readOnly}
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
            readOnly={readOnly}
            onRoll={onRoll}
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
            readOnly={readOnly}
          />
        </div>
      )}

      {activeTab === 'pericias' && (
        <div className="card sheet-section">
          <SkillsEditor
            ranks={char.skill_ranks}
            abilities={char.abilities}
            onChange={(skill_ranks) => set({ skill_ranks })}
            readOnly={readOnly}
            onRoll={onRoll}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
              {onRoll && (
                <button
                  type="button"
                  className="dice-btn"
                  onClick={() => onRoll('Iniciativa', initiativeTotal)}
                >
                  🎲
                </button>
              )}
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
            readOnly={readOnly}
            onRoll={onRoll}
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
            readOnly={readOnly}
          />
        </div>
      )}

      {activeTab === 'complicacoes' && (
        <div className="card sheet-section">
          <textarea
            className="sheet-textarea"
            rows={6}
            value={char.complications}
            disabled={readOnly}
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
                disabled={readOnly}
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
                disabled={readOnly}
                onChange={(e) => set({ hero_points: Number(e.target.value) })}
              />
            </label>
            <label>
              Bônus extra de Iniciativa
              <input
                type="number"
                value={char.initiative}
                disabled={readOnly}
                onChange={(e) => set({ initiative: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}
    </>
  )
}
