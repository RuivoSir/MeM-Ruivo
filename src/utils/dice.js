import { supabase } from '../supabaseClient'

export function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

// Extrai um número inteiro de um texto livre tipo "+8" ou "8 (corpo-a-corpo)".
export function parseModifier(value) {
  const match = String(value ?? '').match(/-?\d+/)
  return match ? parseInt(match[0], 10) : 0
}

// Rola 1d20 + modificador, mostra o resultado na hora (via callback) e
// registra no log da sala (dice_rolls) — visível só para o mestre.
export async function rollAndLog({ roomCode, userId, characterName, label, modifier }) {
  const die = rollD20()
  const mod = Number(modifier) || 0
  const total = die + mod
  const result = {
    label,
    die,
    modifier: mod,
    total,
    isCritical: die === 20,
    isFumble: die === 1,
  }

  await supabase.from('dice_rolls').insert({
    room_code: roomCode,
    user_id: userId,
    character_name: characterName || '',
    label: label || '',
    die_result: die,
    modifier: mod,
    total,
    is_critical: result.isCritical,
    is_fumble: result.isFumble,
  })

  return result
}
