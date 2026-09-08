import { POWER_EFFECT_COSTS, POWER_EFFECT_DESCRIPTIONS } from '../../data/mm3e'

let uid = 0
function nextId() {
  uid += 1
  return `power-${Date.now()}-${uid}`
}

// Custo = (custo-base do efeito + Extras - Falhas) por graduação, com o
// mínimo de 1 ponto por graduação — igual à conta do livro.
export function computePowerCost(power) {
  const base = POWER_EFFECT_COSTS[power.effect] ?? 1
  const perRank = Math.max(1, base + (Number(power.extras) || 0) - (Number(power.flaws) || 0))
  return perRank * (Number(power.rank) || 0)
}

export function totalPowersCost(powers) {
  return (powers || []).reduce((sum, p) => sum + computePowerCost(p), 0)
}

export default function PowersEditor({ powers, onChange, readOnly }) {
  const rows = powers && powers.length ? powers : []

  function update(id, patch) {
    onChange(rows.map((r) => (r._id === id ? { ...r, ...patch } : r)))
  }

  function addPower() {
    onChange([
      ...rows,
      { _id: nextId(), nome: '', effect: 'Dano', rank: 1, extras: 0, flaws: 0, descricao: '' },
    ])
  }

  function removePower(id) {
    onChange(rows.filter((r) => r._id !== id))
  }

  return (
    <div className="powers-editor">
      {rows.map((p) => (
        <div className="power-card" key={p._id}>
          <div className="power-card__row">
            <input
              placeholder="Nome do poder"
              value={p.nome}
              disabled={readOnly}
              onChange={(e) => update(p._id, { nome: e.target.value })}
            />
            <select
              value={p.effect}
              disabled={readOnly}
              onChange={(e) => update(p._id, { effect: e.target.value })}
            >
              {Object.keys(POWER_EFFECT_COSTS).map((fx) => (
                <option key={fx} value={fx}>
                  {fx} ({POWER_EFFECT_COSTS[fx]}/grad)
                </option>
              ))}
            </select>
            {!readOnly && (
              <button
                type="button"
                className="dyn-table__remove"
                onClick={() => removePower(p._id)}
                aria-label="Remover poder"
              >
                ✕
              </button>
            )}
          </div>
          {POWER_EFFECT_DESCRIPTIONS[p.effect] && (
            <p className="power-card__desc muted">{POWER_EFFECT_DESCRIPTIONS[p.effect]}</p>
          )}
          <div className="power-card__row power-card__row--numbers">
            <label>
              Grau
              <input
                type="number"
                min="0"
                value={p.rank}
                disabled={readOnly}
                onChange={(e) => update(p._id, { rank: Number(e.target.value) })}
              />
            </label>
            <label>
              Extras
              <input
                type="number"
                value={p.extras}
                disabled={readOnly}
                onChange={(e) => update(p._id, { extras: Number(e.target.value) })}
              />
            </label>
            <label>
              Falhas
              <input
                type="number"
                value={p.flaws}
                disabled={readOnly}
                onChange={(e) => update(p._id, { flaws: Number(e.target.value) })}
              />
            </label>
            <div className="power-card__cost">
              Custo <strong>{computePowerCost(p)}</strong> pts
            </div>
          </div>
          <textarea
            placeholder="Descritores, modificadores, observações…"
            value={p.descricao}
            disabled={readOnly}
            rows={2}
            onChange={(e) => update(p._id, { descricao: e.target.value })}
          />
        </div>
      ))}

      {!readOnly && (
        <button type="button" className="btn-link" onClick={addPower}>
          + Adicionar poder
        </button>
      )}
      {rows.length === 0 && readOnly && <p className="muted">Nenhum poder.</p>}
    </div>
  )
}
