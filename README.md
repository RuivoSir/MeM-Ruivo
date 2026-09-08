# Mutantes & Malfeitores — Mesa Virtual

Um "sistema operacional" de mesa de RPG para **Mutantes & Malfeitores 3ª Edição**:
no celular abre como uma tela cheia de aplicativos; no computador abre como uma
rede social. Tudo guardado no seu Supabase (Postgres), publicável de graça no
GitHub Pages.

Aplicativos incluídos:

- **Ficha** — ficha de personagem completa (habilidades, defesas, ataques,
  perícias, vantagens, poderes, equipamento, complicações, foto).
- **Contatos** — agenda de NPCs criada pelo mestre (foto, nome, telefone, descrição).
- **Maps** — cards de locais da campanha (foto, nome, informação rápida, descrição).
- **wikiNewsNew** — perfis de NPCs; cada um tem seu próprio "feed" de notícias
  publicadas pelo mestre.
- **Rolagens** (só o mestre vê) — log em tempo real de tudo que o grupo rolou
  na sala.

Uma sala = uma campanha. Quem cria a sala vira o **mestre** (admin); os demais
entram com o código da sala e viram **jogadores**, cada um com sua própria ficha.

### Ficha: automações

A ficha é organizada em abas (Pessoal, Habilidades, Defesas, Perícias,
Vantagens, Poderes, Ofensiva, Equipamentos, Complicações, Configuração).

- **Poderes** tem um construtor de verdade: escolha o efeito (Dano, Voo,
  Cura, Teleporte...) numa lista com todos os efeitos oficiais do Capítulo 6,
  o custo por graduação vem direto do livro, e Extras/Falhas ajustam esse
  custo automaticamente — o total em pontos é calculado sozinho.
- **Defesas** e **Iniciativa** também calculam o total sozinhas (habilidade +
  graduação/bônus).
- A aba **Configuração** soma Habilidades (2/grad), Defesas (1/grad),
  Perícias (1 a cada 2 graduações) e Poderes automaticamente, e mostra um
  selo verde/vermelho comparando o total gasto com o limite da Nível de Poder
  × 15 — igual ao "PP usado/total" de fichas prontas.
- Cada habilidade, perícia e ataque (aba Ofensiva) tem um botão 🎲 que rola
  1d20 + o bônus na hora, mostra o resultado (com aviso de crítico/falha
  crítica) e registra no log da sala. A aba Ofensiva também mostra Esquiva CD
  e Aparar CD prontos.
- **Vantagens** e **Equipamento** têm autocompletar com os nomes oficiais do
  livro.
- **Exportar ficha** baixa um `.json` da ficha atual; **Importar ficha**
  recarrega um desses arquivos na ficha aberta (não salva sozinho — confira e
  clique em Salvar).
- O mestre pode ver e editar a ficha de **qualquer jogador da sala**, pelo
  seletor "Ver ficha de" no topo do app Ficha.

## 1. Configurar o Supabase

No [dashboard do Supabase](https://supabase.com/dashboard), no seu projeto:

1. **SQL Editor** → New query → cole todo o conteúdo de
   [supabase/schema.sql](supabase/schema.sql) → Run. Isso cria as tabelas, as
   políticas de Row Level Security, liga o Realtime nelas e cria o bucket de
   fotos (`room-photos`). Pode rodar de novo com segurança se precisar reaplicar.
2. **Authentication → Sign-in method** já vem com **E-mail/senha ativado por
   padrão** no Supabase — diferente do Firebase, não precisa ativar nada aqui.
   Se quiser pular a confirmação por e-mail durante os testes: **Authentication
   → Providers → Email → desative "Confirm email"**.
3. **Settings → API Keys** → copie a **Project URL** e a **Publishable key**
   (`sb_publishable_...`).
4. Abra [src/supabaseConfig.js](src/supabaseConfig.js) e confira se `supabaseUrl`
   e `supabasePublishableKey` são os valores do seu projeto. Assim como as
   chaves do Firebase, esses valores não são segredo — quem protege os dados são
   as políticas de RLS em `supabase/schema.sql`, não o sigilo da chave. **Nunca**
   use a "secret key" (`sb_secret_...`) no código do site — essa é só para
   servidor.

## 2. Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## 3. Criar sua conta de mestre (ADM)

Por segurança, isso é algo que só você pode fazer digitando sua própria senha
— nenhuma ferramenta de IA deveria criar contas ou preencher senhas por você.
É rápido:

1. Abra o app, clique em **Criar conta**.
2. Preencha nome de exibição, e-mail e senha à sua escolha.
3. Se a confirmação de e-mail estiver ativada no seu projeto, confirme pelo
   link recebido antes de entrar.
4. Depois de entrar, clique em **Criar sala (serei o mestre)**, dê um nome à
   sala — você já entra como mestre automaticamente.
5. Compartilhe o **código da sala** (mostrado na Home e no app "Sala") com seu
   grupo para eles entrarem como jogadores.

Qualquer pessoa que se cadastrar também pode criar (e ser mestre d)a própria
sala — isso não é exclusivo de ninguém.

### Super-admin (acesso a todas as salas)

O e-mail definido em `SUPER_ADMIN_EMAIL` (em
[src/supabaseConfig.js](src/supabaseConfig.js), hoje
`silva.paulosoares07@gmail.com`) tem acesso de mestre a **qualquer** sala do
sistema, mesmo sem ter entrado nela com um código — na tela de seleção de
sala aparece uma seção extra "Todas as salas" listando tudo. Pra mudar quem é
o super-admin, edite os dois lugares e rode `supabase/schema.sql` de novo:

- `SUPER_ADMIN_EMAIL` em `src/supabaseConfig.js` (controla o que aparece na UI).
- a lista dentro de `is_super_admin()` em `supabase/schema.sql` (controla o
  acesso de verdade, via RLS).

## 4. Publicar no GitHub Pages

1. Crie um repositório no GitHub e suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "Mesa virtual de Mutantes & Malfeitores"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builda e
   publica automaticamente a cada push na `main`. Acompanhe em **Actions**.
4. Depois do primeiro deploy, o link fica em **Settings → Pages**
   (algo como `https://SEU_USUARIO.github.io/SEU_REPO/`).

Como o roteamento usa `HashRouter` (URLs com `#/...`) e o Vite builda com
caminhos relativos, o site funciona em qualquer subpasta do GitHub Pages sem
configuração extra.

## 5. Autorizar o domínio do GitHub Pages no Supabase

Em **Authentication → URL Configuration**, adicione a URL do GitHub Pages
(ex: `https://seu-usuario.github.io`) em **Site URL** ou **Redirect URLs** —
importante principalmente se ativar confirmação de e-mail (o link do e-mail
precisa apontar de volta pro site certo).

## Estrutura do projeto

```
src/
  supabaseConfig.js       # URL + chave pública do Supabase (edite aqui)
  supabaseClient.js        # cliente do Supabase (auth, banco, storage)
  contexts/                 # AuthContext (login) e RoomContext (sala atual)
  hooks/useSupabaseData.js  # leitura + tempo real (útil em várias páginas)
  data/mm3e.js              # habilidades, defesas, perícias e vantagens do sistema
  data/apps.js              # registro dos "aplicativos" (ícones, cores, rotas)
  components/shell/         # MobileShell (tela de apps) e DesktopShell (rede social)
  components/sheet/         # peças da ficha de personagem
  pages/                    # uma página por app + login/seleção de sala
supabase/schema.sql          # tabelas, RLS, realtime e bucket de fotos
.github/workflows/deploy.yml
```

## Modelo de dados (Postgres / Supabase)

```
profiles(id, display_name)                          → 1 por usuário (criado por trigger no signup)
rooms(code, name, owner_uid)                         → code é o código de convite
room_members(room_code, user_id, display_name, role) → papel (gm | player)
characters(room_code, owner_uid, ...ficha)           → 1 ficha por jogador por sala
contacts(id, room_code, ...)                         → só o mestre edita
locations(id, room_code, ...)                        → locais do Maps, só o mestre edita
npcs(id, room_code, ...)                             → NPCs do wikiNewsNew
npc_news(id, npc_id, room_code, ...)                 → notícias de um NPC
```

Segurança via **Row Level Security**: cada tabela só é visível para quem tem
uma linha em `room_members` para aquela `room_code` (funções auxiliares
`is_room_member` / `is_room_gm` / `is_room_owner` em `supabase/schema.sql`).
Fotos ficam no bucket público `room-photos`; só membros da sala podem enviar.
# MeM-Ruivo
