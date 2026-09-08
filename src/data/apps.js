// Registro central dos "aplicativos" do sistema.
// Usado tanto pela tela inicial mobile (grid de ícones) quanto pela
// barra lateral do modo desktop.
export const APPS = [
  {
    id: 'ficha',
    label: 'Ficha',
    icon: '🦸',
    path: 'ficha',
    color: 'linear-gradient(135deg,#ff5f6d,#ffc371)',
  },
  {
    id: 'contatos',
    label: 'Contatos',
    icon: '📇',
    path: 'contatos',
    color: 'linear-gradient(135deg,#42e695,#3bb2b8)',
  },
  {
    id: 'maps',
    label: 'Maps',
    icon: '🗺️',
    path: 'maps',
    color: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  },
  {
    id: 'noticias',
    label: 'wikiNewsNew',
    icon: '📰',
    path: 'noticias',
    color: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
  },
  {
    id: 'rolagens',
    label: 'Rolagens',
    icon: '🎲',
    path: 'rolagens',
    color: 'linear-gradient(135deg,#f7971e,#c0392b)',
    gmOnly: true,
  },
  {
    id: 'escudo',
    label: 'Escudo do Mestre',
    icon: '🛡️',
    path: 'escudo',
    color: 'linear-gradient(135deg,#485563,#29323c)',
    gmOnly: true,
  },
  {
    id: 'info',
    label: 'Sala',
    icon: '⚙️',
    path: 'info',
    color: 'linear-gradient(135deg,#636363,#a2ab58)',
  },
]
