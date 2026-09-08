// Dados de referência do sistema Mutantes & Malfeitores 3ª Edição,
// usados para montar a ficha de personagem digital.

export const ABILITIES = [
  { key: 'forca', label: 'Força' },
  { key: 'agilidade', label: 'Agilidade' },
  { key: 'luta', label: 'Luta' },
  { key: 'prontidao', label: 'Prontidão' },
  { key: 'vigor', label: 'Vigor' },
  { key: 'destreza', label: 'Destreza' },
  { key: 'intelecto', label: 'Intelecto' },
  { key: 'presenca', label: 'Presença' },
]

export const DEFENSES = [
  { key: 'esquiva', label: 'Esquiva', base: 'agilidade' },
  { key: 'aparar', label: 'Aparar', base: 'luta' },
  { key: 'fortitude', label: 'Fortitude', base: 'vigor' },
  { key: 'resistencia', label: 'Resistência', base: 'vigor' },
  { key: 'vontade', label: 'Vontade', base: 'prontidao' },
]

// Perícia -> habilidade vinculada (Capítulo 4: Perícias)
export const SKILLS = [
  { key: 'acrobacia', label: 'Acrobacia', base: 'agilidade' },
  { key: 'atletismo', label: 'Atletismo', base: 'forca' },
  { key: 'combateDistancia', label: 'Combate à Distância', base: 'destreza' },
  { key: 'combateCorpoACorpo', label: 'Combate Corpo-a-Corpo', base: 'luta' },
  { key: 'enganacao', label: 'Enganação', base: 'presenca' },
  { key: 'especialidade', label: 'Especialidade', base: 'intelecto' },
  { key: 'furtividade', label: 'Furtividade', base: 'agilidade' },
  { key: 'intimidacao', label: 'Intimidação', base: 'presenca' },
  { key: 'intuicao', label: 'Intuição', base: 'prontidao' },
  { key: 'investigacao', label: 'Investigação', base: 'intelecto' },
  { key: 'percepcao', label: 'Percepção', base: 'prontidao' },
  { key: 'persuasao', label: 'Persuasão', base: 'presenca' },
  { key: 'prestidigitacao', label: 'Prestidigitação', base: 'destreza' },
  { key: 'tecnologia', label: 'Tecnologia', base: 'intelecto' },
  { key: 'tratamento', label: 'Tratamento', base: 'intelecto' },
  { key: 'veiculos', label: 'Veículos', base: 'destreza' },
]

// Lista de vantagens oficiais (Capítulo 5), usada como sugestão de
// autocompletar — o mestre/jogador pode digitar qualquer outra também.
export const ADVANTAGES = [
  'Ação em Movimento', 'Agarrar Aprimorado', 'Agarrar Preciso', 'Agarrar Rápido',
  'Ambiente Favorito', 'Arma Improvisada', 'Armação', 'Artífice', 'Assustar',
  'Ataque Acurado', 'Ataque à Distância', 'Ataque Corpo-a-Corpo', 'Ataque Defensivo',
  'Ataque Dominó', 'Ataque Imprudente', 'Ataque Poderoso', 'Ataque Preciso',
  'Atraente', 'Avaliação', 'Bem Informado', 'Bem Relacionado', 'Benefício',
  'Capanga', 'Contatos', 'Crítico Aprimorado', 'De Pé', 'Defesa Aprimorada',
  'Derrubar Aprimorado', 'Desarmar Aprimorado', 'Destemido', 'Duro de Matar',
  'Empatia com Animais', 'Equipamento', 'Esconder-se à Plena Vista',
  'Esforço Extraordinário', 'Esforço Supremo', 'Esquiva Fabulosa', 'Estrangular',
  'Evasão', 'Fascinar', 'Faz-Tudo', 'Ferramentas Aprimoradas', 'Finta Ágil',
  'Idiomas', 'Imobilizar Aprimorado', 'Iniciativa Aprimorada', 'Inimigo Favorito',
  'Inspirar', 'Interpor-se', 'Inventor', 'Liderança', 'Luta no Chão',
  'Maestria em Arremesso', 'Maestria em Perícia', 'Memória Eidética',
  'Mira Aprimorada', 'Parceiro', 'Prender Arma', 'Quebrar Aprimorado',
  'Quebrar Arma', 'Rastrear', 'Redirecionar', 'Ritualista', 'Rolamento Defensivo',
  'Saque Rápido', 'Segunda Chance', 'Sorte', 'Sorte de Principiante',
  'Tolerância Maior', 'Tomar a Iniciativa', 'Tontear', 'Trabalho em Equipe',
  'Transe', 'Zombar',
]

// Efeitos de poder oficiais (Capítulo 6) e seu custo-base por graduação,
// direto do livro (Custo de cada efeito). Extras somam ao custo por
// graduação, Falhas subtraem — exatamente como no livro.
export const POWER_EFFECT_COSTS = {
  Aflição: 1,
  Alongamento: 1,
  Ambiente: 1,
  Camuflagem: 2,
  Característica: 1,
  'Característica Aumentada': 1,
  Compreender: 2,
  Comunicação: 4,
  'Controle da Sorte': 3,
  Crescimento: 2,
  Criar: 2,
  Cura: 2,
  Dano: 1,
  Deflexão: 1,
  Encolhimento: 2,
  Enfraquecer: 1,
  Escavação: 1,
  Ilusão: 1,
  Imortalidade: 2,
  Imunidade: 1,
  Intangibilidade: 5,
  Invocar: 2,
  'Leitura Mental': 2,
  'Membros Extras': 1,
  Morfar: 5,
  'Mover Objeto': 2,
  Movimento: 2,
  Natação: 1,
  Nulificar: 1,
  Proteção: 1,
  Raio: 2,
  'Rajada Mental': 4,
  Rapidez: 1,
  Regeneração: 1,
  Salto: 1,
  Sentidos: 1,
  'Sentido Remoto': 1,
  Sono: 2,
  Sufocamento: 4,
  Supervelocidade: 1,
  Teleporte: 2,
  Transformação: 2,
  Variável: 7,
  Velocidade: 1,
  Voo: 2,
}

export const POWER_EFFECTS = Object.keys(POWER_EFFECT_COSTS)

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

// Pontos de Habilidades, Defesas, Perícias e Poderes vêm sempre calculados
// pelas regras do livro — só Vantagens fica a critério de quem edita, porque
// o custo de cada vantagem varia (Sorte, Contatos, Benefício...).
export function computePointsBreakdown(character) {
  const abilities =
    2 * Object.values(character?.abilities || {}).reduce((s, v) => s + (Number(v) || 0), 0)
  const defenses = Object.values(character?.defenses || {}).reduce((s, v) => s + (Number(v) || 0), 0)
  const skills = Math.ceil(
    Object.values(character?.skill_ranks || {}).reduce((s, v) => s + (Number(v) || 0), 0) / 2
  )
  const powers = totalPowersCost(character?.powers)
  const advantages = Number(character?.points_breakdown?.advantages || 0)
  return { abilities, defenses, skills, powers, advantages }
}

// Resumo próprio (não é o texto do livro) do que cada efeito faz na prática,
// só pra lembrete rápido ao montar o poder.
export const POWER_EFFECT_DESCRIPTIONS = {
  Aflição: 'Impõe condições debilitantes (tonto, vulnerável, incapacitado) num alvo que falhar no teste de resistência.',
  Alongamento: 'Estica seu corpo ou membros para alcançar longe e atacar corpo-a-corpo à distância.',
  Ambiente: 'Muda as condições do ambiente ao redor — calor, frio, luz, chuva — numa área.',
  Camuflagem: 'Torna você indetectável a um tipo específico de sentido.',
  Característica: 'Compra uma característica ou perícia especial fora das regras padrão.',
  'Característica Aumentada': 'Aumenta temporariamente uma de suas características enquanto ativo.',
  Compreender: 'Permite entender (e opcionalmente falar) idiomas, animais, máquinas, plantas ou espíritos.',
  Comunicação: 'Envia mensagens à distância por um meio de comunicação especial.',
  'Controle da Sorte': 'Manipula pontos heroicos e a vantagem Sorte, sua ou de outros.',
  Crescimento: 'Aumenta de tamanho, ganhando Força e Vigor às custas de Destreza e Furtividade.',
  Criar: 'Forma objetos sólidos a partir do nada.',
  Cura: 'Remove condições de dano de um alvo tocado.',
  Dano: 'Causa dano físico ou de energia em combate corpo-a-corpo.',
  Deflexão: 'Defende outros contra ataques à distância, desviando-os.',
  Encolhimento: 'Diminui de tamanho — mais furtivo e difícil de acertar, porém mais fraco.',
  Enfraquecer: 'Reduz temporariamente uma característica do alvo.',
  Escavação: 'Permite se mover através da terra e do solo.',
  Ilusão: 'Cria imagens, sons ou sensações falsas nos sentidos de outros.',
  Imortalidade: 'Permite retornar à vida depois de morrer, após um tempo.',
  Imunidade: 'Concede imunidade automática a um ou mais efeitos específicos.',
  Intangibilidade: 'Torna seu corpo intangível, atravessando objetos sólidos.',
  Invocar: 'Chama uma criatura (capanga) para lutar ao seu lado.',
  'Leitura Mental': 'Lê os pensamentos de outro personagem.',
  'Membros Extras': 'Concede braços, tentáculos ou outros membros manipuladores extras.',
  Morfar: 'Muda sua aparência para outra forma, sem alterar suas características.',
  'Mover Objeto': 'Move objetos à distância sem tocá-los.',
  Movimento: 'Concede uma forma especial de deslocamento, como deslizar ou escalar.',
  Natação: 'Permite nadar rapidamente pela água.',
  Nulificar: 'Cancela ou neutraliza os efeitos de outro poder.',
  Proteção: 'Aumenta sua Resistência contra dano.',
  Raio: 'Causa dano à distância, como um projétil ou rajada de energia.',
  'Rajada Mental': 'Ataque mental à distância que afeta a Vontade do alvo.',
  Rapidez: 'Realiza tarefas de rotina muito mais rápido que o normal.',
  Regeneração: 'Recupera-se de dano rapidamente com o tempo.',
  Salto: 'Dá saltos muito mais longos e altos que o normal.',
  Sentidos: 'Concede sentidos extras ou aprimorados.',
  'Sentido Remoto': 'Projeta um dos seus sentidos para um local distante.',
  Sono: 'Coloca o alvo para dormir se ele falhar no teste de resistência.',
  Sufocamento: 'Impede o alvo de respirar, causando dano progressivo.',
  Supervelocidade: 'Realiza tarefas físicas numa fração do tempo normal.',
  Teleporte: 'Move-se instantaneamente de um local para outro.',
  Transformação: 'Transforma um alvo ou objeto em outra coisa.',
  Variável: 'Poder flexível que pode ser reconfigurado para efeitos diferentes.',
  Velocidade: 'Aumenta sua velocidade de movimento terrestre.',
  Voo: 'Permite voar pelo ar.',
}

// Sugestões comuns de equipamento (Capítulo 7), só os nomes — os detalhes e
// custos ficam a critério do grupo.
export const EQUIPMENT_ITEMS = [
  'Traje de Batalha', 'Uniforme', 'Cinto de Utilidade', 'Comunicador',
  'Kit de Ferramentas', 'Kit Médico', 'Algemas', 'Corda e Gancho',
  'Lanterna', 'Colete à Prova de Balas', 'Escudo', 'Faca', 'Pistola',
  'Rifle', 'Espingarda', 'Submetralhadora', 'Soqueira', 'Soqueira Energizada',
  'Taser', 'Spray de Pimenta', 'Granada de Fumaça', 'Kit de Disfarce',
  'Veículo Terrestre', 'Veículo Aéreo', 'Veículo Aquático', 'Quartel-General',
]

export function abilityMod(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function emptyAbilities() {
  return Object.fromEntries(ABILITIES.map((a) => [a.key, 0]))
}

export function emptyDefenses() {
  return Object.fromEntries(DEFENSES.map((d) => [d.key, 0]))
}

export function emptySkillRanks() {
  return Object.fromEntries(SKILLS.map((s) => [s.key, 0]))
}

export function blankCharacter(roomCode, ownerUid) {
  return {
    room_code: roomCode,
    owner_uid: ownerUid,
    hero_name: '',
    player_name: '',
    identity: '',
    secret_identity: true,
    gender: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    hair: '',
    group_name: '',
    base_of_operations: '',
    power_level: 10,
    photo_url: '',
    points_breakdown: {
      abilities: 0,
      powers: 0,
      advantages: 0,
      skills: 0,
      defenses: 0,
    },
    abilities: emptyAbilities(),
    defenses: emptyDefenses(),
    initiative: 0,
    attacks: [],
    skill_ranks: emptySkillRanks(),
    advantages: [],
    powers: [],
    equipment: [],
    complications: '',
    hero_points: 1,
    power_points: 0,
  }
}

export const GM_CATEGORIES = [
  { id: 'npc', label: 'NPCs', icon: '🧑' },
  { id: 'vilao', label: 'Vilões', icon: '🦹' },
  { id: 'heroi', label: 'Heróis', icon: '🦸' },
]

export function blankGmCharacter(roomCode, category) {
  const { owner_uid: _owner_uid, ...rest } = blankCharacter(roomCode, null)
  return {
    ...rest,
    category: category || 'npc',
    hero_points: 0,
  }
}
