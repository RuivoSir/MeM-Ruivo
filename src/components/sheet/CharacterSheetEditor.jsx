import { useState } from 'react'
import {
  ABILITIES,
  ADVANTAGES,
  DEFENSES,
  EQUIPMENT_ITEMS,
  SKILLS,
  computePointsBreakdown,
} from '../../data/mm3e'
import AbilitiesGrid from './AbilitiesGrid'
import DefensesGrid from './DefensesGrid'
import SkillsEditor from './SkillsEditor'
import DynamicTable from './DynamicTable'
import PowersEditor from './PowersEditor'
import PhotoUpload from '../common/PhotoUpload'
import Modal from '../common/Modal'

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

const SECTIONS = [
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

// Corpo completo de uma ficha: cabeçalho pessoal sempre visível + cards de
// seção (Habilidades, Perícias, Poderes...) que abrem num modal de edição
// ao serem clicados — usado tanto pela Ficha do jogador quanto pelo Escudo
// do Mestre (NPCs/vilões/heróis).
export default function CharacterSheetEditor({ character, onChange, readOnly, onRoll, photoPath }) {
  const [openSection, setOpenSection] = useState(null)
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

  function summaryFor(id) {
    switch (id) {
      case 'habilidades':
        return ABILITIES.map((a) => `${a.label.slice(0, 3)} ${char.abilities?.[a.key] ?? 0}`).join(' · ')
      case 'defesas':
        return DEFENSES.map((d) => {
          const total = (Number(char.abilities?.[d.base]) || 0) + (Number(char.defenses?.[d.key]) || 0)
          return `${d.label.slice(0, 3)} ${total}`
        }).join(' · ')
      case 'pericias': {
        const trained = SKILLS.filter((s) => Number(char.skill_ranks?.[s.key]) > 0).length
        return trained === 0 ? 'Nenhuma treinada' : `${trained} treinada${trained === 1 ? '' : 's'}`
      }
      case 'vantagens': {
        const n = (char.advantages || []).length
        return n === 0 ? 'Nenhuma' : `${n} vantagem${n === 1 ? '' : 's'}`
      }
      case 'poderes': {
        const n = (char.powers || []).length
        return n === 0 ? 'Nenhum' : `${n} poder${n === 1 ? '' : 'es'} · ${pointsBreakdown.powers} pts`
      }
      case 'ofensiva': {
        const n = (char.attacks || []).length
        return `${n} ataque${n === 1 ? '' : 's'} · Iniciativa ${initiativeTotal}`
      }
      case 'equipamentos': {
        const n = (char.equipment || []).length
        return n === 0 ? 'Nenhum item' : `${n} item${n === 1 ? '' : 'ns'}`
      }
      case 'complicacoes':
        return char.complications ? char.complications.slice(0, 60) : 'Nenhuma'
      case 'config':
        return `${totalPoints} / ${powerBudget} PP${overBudget ? ' — acima do limite' : ''}`
      default:
        return ''
    }
  }

  function renderSectionBody(id) {
    switch (id) {
      case 'habilidades':
        return (
          <>
            <p className="muted">Clique no dado pra rolar um teste da habilidade.</p>
            <AbilitiesGrid
              values={char.abilities}
              onChange={(abilities) => set({ abilities })}
              readOnly={readOnly}
              onRoll={onRoll}
            />
          </>
        )
      case 'defesas':
        return (
          <>
            <p className="muted">
              Digite as graduações compradas — o total (habilidade + graduação) é calculado sozinho.
            </p>
            <DefensesGrid
              ranks={char.defenses}
              abilities={char.abilities}
              onChange={(defenses) => set({ defenses })}
              readOnly={readOnly}
            />
          </>
        )
      case 'pericias':
        return (
          <SkillsEditor
            ranks={char.skill_ranks}
            abilities={char.abilities}
            onChange={(skill_ranks) => set({ skill_ranks })}
            readOnly={readOnly}
            onRoll={onRoll}
          />
        )
      case 'vantagens':
        return (
          <DynamicTable
            columns={ADVANTAGE_COLUMNS}
            rows={withRowIds(char.advantages)}
            onChange={(advantages) => set({ advantages })}
            addLabel="Adicionar vantagem"
            readOnly={readOnly}
          />
        )
      case 'poderes':
        return (
          <>
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
          </>
        )
      case 'ofensiva':
        return (
          <>
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
          </>
        )
      case 'equipamentos':
        return (
          <DynamicTable
            columns={EQUIPMENT_COLUMNS}
            rows={withRowIds(char.equipment)}
            onChange={(equipment) => set({ equipment })}
            addLabel="Adicionar item"
            readOnly={readOnly}
          />
        )
      case 'complicacoes':
        return (
          <textarea
            className="sheet-textarea"
            rows={8}
            value={char.complications}
            disabled={readOnly}
            onChange={(e) => set({ complications: e.target.value })}
          />
        )
      case 'config':
        return (
          <>
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
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
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

      <div
        className={`progress-bar sheet-pp-bar ${overBudget ? 'progress-bar--over' : ''}`}
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

      <div className="section-card-grid">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="section-card"
            onClick={() => setOpenSection(s.id)}
          >
            <span className="section-card__top">
              <span className="section-card__icon">{s.icon}</span>
              <span className="section-card__label">{s.label}</span>
            </span>
            <span className="section-card__summary">{summaryFor(s.id)}</span>
          </button>
        ))}
      </div>

      {openSection && (
        <Modal
          title={`${SECTIONS.find((s) => s.id === openSection).icon} ${SECTIONS.find((s) => s.id === openSection).label}`}
          onClose={() => setOpenSection(null)}
          wide
        >
          {renderSectionBody(openSection)}
        </Modal>
      )}
    </>
  )
}
