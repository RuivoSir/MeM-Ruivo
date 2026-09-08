// Configuração do Supabase.
//
// Assim como as chaves web do Firebase, a URL do projeto e a "publishable key"
// (chave pública, antigo "anon key") NÃO são segredos — foram feitas para
// ficar no código do cliente. Quem protege os dados são as políticas de
// Row Level Security definidas em supabase/schema.sql, não o sigilo destes
// valores. NUNCA coloque aqui a "secret key" (sb_secret_...) — essa sim é
// privada e só deve ser usada em ambiente de servidor.
export const supabaseUrl = 'https://svjibqdecaatchzujxod.supabase.co'
export const supabasePublishableKey = 'sb_publishable_JaqpK_K46mhh86bfR6u1xg_VBdcIAWL'

// E-mail com acesso de super-admin a QUALQUER sala do sistema (não precisa
// ser membro/mestre daquela sala específica). Precisa bater com a lista em
// is_super_admin() dentro de supabase/schema.sql — mude os dois juntos.
export const SUPER_ADMIN_EMAIL = 'silva.paulosoares07@gmail.com'
