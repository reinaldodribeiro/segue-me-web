import { TutorialConfig } from '@/types/tutorial';

/**
 * Single source of truth for all tutorial content.
 *
 * Key = canonical pathname under /app (matching ROUTE_PERMISSIONS keys).
 * Dynamic segments use the [id] form (matched via normalization in context).
 *
 * Steps reference DOM elements via `data-tutorial="<step-id>"` attributes.
 * Missing elements are silently skipped at runtime.
 */
export const TUTORIALS: Record<string, TutorialConfig> = {

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  '/app': {
    name: 'Dashboard',
    steps: [
      {
        id: 'dashboard-kpi-cards',
        title: 'Indicadores Principais',
        content: 'Aqui você vê os números essenciais da sua paróquia: total de pessoas, score médio de engajamento, total de encontros e encontros confirmados.',
        placement: 'bottom',
      },
      {
        id: 'dashboard-parish-filter',
        title: 'Filtro de Paróquia',
        content: 'Como administrador de diocese ou setor, use este filtro para selecionar uma paróquia específica e ver seus dados isoladamente.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
      {
        id: 'dashboard-score-chart',
        title: 'Distribuição de Scores',
        content: 'Histograma que mostra a distribuição de pontuação de engajamento das pessoas cadastradas. Faixas mais altas indicam maior envolvimento nas atividades.',
        placement: 'top',
      },
      {
        id: 'dashboard-engagement-chart',
        title: 'Nível de Engajamento',
        content: 'Proporção de pessoas por categoria de engajamento: Baixo, Médio, Alto e Destaque. Útil para identificar onde concentrar esforços pastorais.',
        placement: 'top',
      },
      {
        id: 'dashboard-recent-encounters',
        title: 'Encontros Recentes',
        content: 'Lista dos encontros mais recentes com seus status. Clique em qualquer encontro para acessar seus detalhes diretamente.',
        placement: 'top',
      },
      {
        id: 'dashboard-top-people',
        title: 'Mais Engajados',
        content: 'As cinco pessoas com maior pontuação de engajamento. Esses são seus colaboradores mais ativos.',
        placement: 'top',
      },
      {
        id: 'dashboard-quick-actions',
        title: 'Ações Rápidas',
        content: 'Atalhos para as operações mais frequentes: cadastrar pessoa, criar encontro, gerenciar usuários e relatórios.',
        placement: 'top',
      },
    ],
  },

  // ─── People — List ─────────────────────────────────────────────────────────
  '/app/people': {
    name: 'Listagem de Pessoas',
    steps: [
      {
        id: 'people-header',
        title: 'Pessoas (Fichas)',
        content: 'Aqui estão cadastradas todas as pessoas da sua paróquia — participantes, voluntários e casais. O contador no subtítulo mostra o total.',
        placement: 'bottom',
      },
      {
        id: 'people-import-btn',
        title: 'Importar por Planilha',
        content: 'Envie uma planilha Excel com múltiplas fichas de uma vez. Baixe o modelo para garantir o formato correto.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'people-ocr-btn',
        title: 'Importar por Imagem (OCR)',
        content: 'Tire uma foto de uma ficha de papel e o sistema extrairá os dados automaticamente usando inteligência artificial.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'people-new-btn',
        title: 'Nova Pessoa',
        content: 'Cadastra uma nova ficha manualmente. O sistema verifica automaticamente se já existe um registro similar (detecção de duplicatas).',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'people-filters',
        title: 'Filtros',
        content: 'Busque por nome, e-mail ou telefone. Filtre por tipo (Jovem / Casal) e, se for administrador, por diocese, setor ou paróquia.',
        placement: 'bottom',
      },
      {
        id: 'people-table',
        title: 'Tabela de Pessoas',
        content: 'Clique no cabeçalho "Nome" ou "Engajamento" para ordenar. O ícone de troféu indica o ano do encontro da pessoa. Clique em "Ver" para abrir a ficha completa.',
        placement: 'top',
      },
    ],
  },

  // ─── People — New ──────────────────────────────────────────────────────────
  '/app/people/new': {
    name: 'Cadastrar Pessoa',
    steps: [
      {
        id: 'new-person-type',
        title: 'Tipo de Participante',
        content: 'Selecione "Jovem" para fichas individuais ou "Casal" para fichas conjuntas. A seleção muda os campos disponíveis.',
        placement: 'bottom',
      },
      {
        id: 'new-person-photo',
        title: 'Foto',
        content: 'Opcionalmente envie uma foto para a ficha. Isso facilita a identificação visual nas equipes.',
        placement: 'right',
      },
      {
        id: 'new-person-basic-fields',
        title: 'Dados Básicos',
        content: 'Preencha nome, data de nascimento e contato. O campo "Ano do encontro" registra quando a pessoa passou pelo encontro.',
        placement: 'bottom',
      },
      {
        id: 'new-person-skills',
        title: 'Habilidades (Skills)',
        content: 'Registre as habilidades da pessoa para o sistema poder sugerir membros adequados para cada equipe automaticamente.',
        placement: 'top',
      },
      {
        id: 'new-person-experiences',
        title: 'Experiências em Equipes',
        content: 'Informe em quais equipes esta pessoa já participou e em qual função. Esse histórico alimenta o score de engajamento.',
        placement: 'top',
      },
    ],
  },

  // ─── People — Detail ───────────────────────────────────────────────────────
  '/app/people/[id]': {
    name: 'Ficha da Pessoa',
    steps: [
      {
        id: 'person-detail-header',
        title: 'Perfil da Pessoa',
        content: 'Aqui você vê e edita todos os dados de uma pessoa. O badge de engajamento (Baixo / Médio / Alto / Destaque) é calculado automaticamente com base no histórico.',
        placement: 'bottom',
      },
      {
        id: 'person-detail-engagement-score',
        title: 'Score de Engajamento',
        content: 'Pontuação de 0 a 100. Aumenta quando a pessoa participa de equipes, recebe avaliações positivas e tem histórico ativo.',
        placement: 'bottom',
      },
      {
        id: 'person-detail-edit-form',
        title: 'Editar Dados',
        content: 'Altere nome, foto, contato e habilidades. Clique em "Salvar" para confirmar as alterações.',
        placement: 'top',
      },
      {
        id: 'person-detail-history',
        title: 'Histórico de Participação',
        content: 'Registros de todos os encontros e equipes em que esta pessoa esteve. O histórico é imutável — cada encontro concluído adiciona uma entrada.',
        placement: 'top',
      },
      {
        id: 'person-detail-experiences',
        title: 'Experiências em Equipes',
        content: 'Habilidades e funções exercidas em equipes anteriores. Use para enriquecer o perfil e melhorar as sugestões de IA.',
        placement: 'top',
      },
    ],
  },

  // ─── Encounters — List ─────────────────────────────────────────────────────
  '/app/encounters': {
    name: 'Listagem de Encontros',
    steps: [
      {
        id: 'encounters-header',
        title: 'Encontros',
        content: 'Todos os encontros cadastrados, com status (Rascunho, Confirmado, Concluído). Diocese e setor veem encontros de múltiplas paróquias.',
        placement: 'bottom',
      },
      {
        id: 'encounters-new-btn',
        title: 'Novo Encontro',
        content: 'Cria um novo encontro a partir de um movimento existente. Após criar, você poderá montar as equipes e adicionar participantes.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'encounters-filters',
        title: 'Busca e Filtros',
        content: 'Filtre por nome ou status. Use o filtro de status para ver apenas encontros confirmados ou concluídos.',
        placement: 'bottom',
      },
      {
        id: 'encounters-table',
        title: 'Tabela de Encontros',
        content: 'Clique em "Ver" para acessar o painel completo de um encontro, incluindo participantes, equipes e geração de relatório em PDF.',
        placement: 'top',
      },
    ],
  },

  // ─── Encounters — New ──────────────────────────────────────────────────────
  '/app/encounters/new': {
    name: 'Criar Encontro',
    steps: [
      {
        id: 'new-encounter-movement',
        title: 'Movimento',
        content: 'Selecione o movimento ao qual este encontro pertence. O movimento define o tipo de equipes disponíveis (roles, capacidades, etc.).',
        placement: 'bottom',
      },
      {
        id: 'new-encounter-name',
        title: 'Nome e Edição',
        content: 'Dê um nome descritivo ao encontro e informe o número da edição para facilitar a referência histórica.',
        placement: 'bottom',
      },
      {
        id: 'new-encounter-date',
        title: 'Data e Duração',
        content: 'Selecione a data de início e o número de dias. O sistema exibirá um resumo das datas para confirmação.',
        placement: 'bottom',
      },
      {
        id: 'new-encounter-location',
        title: 'Local e Participantes',
        content: 'Informe o local e o número máximo de participantes. Esses dados aparecem no relatório PDF gerado ao final.',
        placement: 'bottom',
      },
    ],
  },

  // ─── Encounters — Detail ───────────────────────────────────────────────────
  '/app/encounters/[id]': {
    name: 'Detalhes do Encontro',
    steps: [
      {
        id: 'encounter-detail-header',
        title: 'Painel do Encontro',
        content: 'Visão geral do encontro: nome, data, local, status e número de participantes confirmados. O status controla o que pode ser editado.',
        placement: 'bottom',
      },
      {
        id: 'encounter-detail-status',
        title: 'Status do Encontro',
        content: 'Rascunho → Confirmado → Concluído. Apenas parish_admin e super_admin podem alterar o status. A transição para "Concluído" gera o histórico de participação.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin'],
      },
      {
        id: 'encounter-detail-teams-link',
        title: 'Montar Equipes',
        content: 'Acessa a tela de drag-and-drop para distribuir pessoas nas equipes. Disponível assim que o encontro está em qualquer status.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'encounter-detail-encontristas',
        title: 'Encontristas',
        content: 'Lista de todos os participantes inscritos no encontro. Use os botões de importar/exportar para gerenciar em lote.',
        placement: 'top',
      },
      {
        id: 'encounter-detail-pdf',
        title: 'Relatório PDF',
        content: 'Gera o relatório completo do encontro com equipes, participantes e estatísticas. Abre em nova aba para impressão.',
        placement: 'top',
      },
      {
        id: 'encounter-detail-ai-analysis',
        title: 'Análise por IA',
        content: 'O Claude analisa as fichas dos participantes e equipes e sugere melhorias na composição. Disponível para encontros confirmados.',
        placement: 'top',
        roles: ['super_admin', 'parish_admin'],
      },
    ],
  },

  // ─── Encounters — Teams ────────────────────────────────────────────────────
  '/app/encounters/[id]/teams': {
    name: 'Montar Equipes',
    steps: [
      {
        id: 'teams-stats-bar',
        title: 'Barra de Estatísticas',
        content: 'Mostra vagas preenchidas vs. total, confirmações e se as equipes estão completas. O progresso atualiza em tempo real ao arrastar.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'teams-people-panel',
        title: 'Painel de Pessoas',
        content: 'Pessoas disponíveis para inserção nas equipes. Arraste um card para a vaga desejada na grade ou clique no botão "+" dentro de cada vaga.',
        placement: 'right',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'teams-grid',
        title: 'Grade de Equipes',
        content: 'Cada card representa uma equipe com suas vagas (ex: líder, vice-líder, membros). Arraste pessoas da lista à esquerda para preencher as vagas.',
        placement: 'left',
        roles: ['super_admin', 'parish_admin', 'coordinator'],
      },
      {
        id: 'teams-ai-suggest',
        title: 'Sugestão por IA',
        content: 'O Claude analisa habilidades e histórico de cada pessoa e sugere a composição ideal para as equipes. Clique para aplicar as sugestões.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin'],
      },
    ],
  },

  // ─── Movements — List ──────────────────────────────────────────────────────
  '/app/movements': {
    name: 'Listagem de Movimentos',
    steps: [
      {
        id: 'movements-header',
        title: 'Movimentos',
        content: 'Movimentos são os programas ou projetos que organizam encontros (ex: Encontro de Jovens, Encontro de Casais). Cada encontro pertence a um movimento.',
        placement: 'bottom',
      },
      {
        id: 'movements-new-btn',
        title: 'Novo Movimento',
        content: 'Cria um movimento com nome, público-alvo (jovens ou casais) e escopo (paroquial ou diocesano). Após criar, configure as equipes-modelo.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin'],
      },
      {
        id: 'movements-search',
        title: 'Busca',
        content: 'Filtre movimentos pelo nome. A busca é feita localmente sobre os dados já carregados.',
        placement: 'bottom',
      },
      {
        id: 'movements-table',
        title: 'Lista de Movimentos',
        content: 'Cada linha mostra o movimento com seu escopo e público. Clique em "Ver" para editar o movimento e gerenciar suas equipes-modelo.',
        placement: 'top',
      },
    ],
  },

  // ─── Movements — New ───────────────────────────────────────────────────────
  '/app/movements/new': {
    name: 'Criar Movimento',
    steps: [
      {
        id: 'new-movement-name',
        title: 'Nome do Movimento',
        content: 'Dê um nome claro ao movimento. Este nome aparecerá ao criar encontros e nos relatórios.',
        placement: 'bottom',
      },
      {
        id: 'new-movement-audience',
        title: 'Público-Alvo',
        content: 'Selecione se o movimento é para Jovens ou Casais. Isso filtra o tipo de participantes elegíveis para os encontros deste movimento.',
        placement: 'bottom',
      },
      {
        id: 'new-movement-scope',
        title: 'Escopo',
        content: 'Paroquial: restrito à sua paróquia. Diocesano: visível e utilizável por todas as paróquias da diocese.',
        placement: 'bottom',
      },
    ],
  },

  // ─── Movements — Detail ────────────────────────────────────────────────────
  '/app/movements/[id]': {
    name: 'Detalhes do Movimento',
    steps: [
      {
        id: 'movement-detail-info',
        title: 'Informações do Movimento',
        content: 'Edite o nome, público-alvo, escopo e descrição do movimento. As alterações afetam todos os encontros futuros vinculados a ele.',
        placement: 'bottom',
      },
      {
        id: 'movement-detail-teams',
        title: 'Equipes-Modelo',
        content: 'Define quais equipes este movimento utiliza (ex: Equipe Alpha, Beta…). Cada equipe tem um nome, ícone e número de vagas por função. Este é o modelo base usado em cada encontro.',
        placement: 'top',
      },
      {
        id: 'movement-detail-add-team',
        title: 'Adicionar Equipe',
        content: 'Clique em "+ Adicionar Equipe" para criar uma nova equipe-modelo. Configure nome, ícone, vagas de líder, vice-líder e membros.',
        placement: 'top',
        roles: ['super_admin', 'parish_admin'],
      },
    ],
  },

  // ─── Movements — Teams ─────────────────────────────────────────────────────
  '/app/movements/[id]/teams': {
    name: 'Equipes-Modelo do Movimento',
    steps: [
      {
        id: 'movement-teams-list',
        title: 'Equipes-Modelo',
        content: 'Estas equipes servem de modelo para todos os encontros deste movimento. Arraste para reordenar. Cada encontro herda esta estrutura.',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin'],
      },
      {
        id: 'movement-teams-add',
        title: 'Adicionar Equipe',
        content: 'Crie uma nova equipe-modelo informando nome, ícone visual e número de vagas para cada função (líder, vice, membros).',
        placement: 'bottom',
        roles: ['super_admin', 'parish_admin'],
      },
    ],
  },

  // ─── Users — List ──────────────────────────────────────────────────────────
  '/app/users': {
    name: 'Gestão de Usuários',
    steps: [
      {
        id: 'users-header',
        title: 'Usuários do Sistema',
        content: 'Lista todos os usuários que você pode gerenciar dentro da sua hierarquia. Super-admin vê todos; diocese_admin vê usuários da sua diocese, e assim por diante.',
        placement: 'bottom',
      },
      {
        id: 'users-new-btn',
        title: 'Novo Usuário',
        content: 'Cria uma conta de acesso ao sistema. Você precisará definir o papel (role) e o escopo hierárquico (diocese/setor/paróquia) do novo usuário.',
        placement: 'bottom',
      },
      {
        id: 'users-filters',
        title: 'Filtros',
        content: 'Filtre por nome, papel (role) ou status (ativo/inativo). Útil para localizar usuários específicos em sistemas com muitas contas.',
        placement: 'bottom',
      },
      {
        id: 'users-table',
        title: 'Lista de Usuários',
        content: 'Cada linha mostra o papel do usuário e seu status. Clique em "Editar" para alterar dados ou desativar a conta.',
        placement: 'top',
      },
    ],
  },

  // ─── Users — New ───────────────────────────────────────────────────────────
  '/app/users/new': {
    name: 'Criar Usuário',
    steps: [
      {
        id: 'new-user-basic',
        title: 'Dados de Acesso',
        content: 'Informe nome, e-mail e senha. O e-mail deve ser único no sistema e será usado para login.',
        placement: 'bottom',
      },
      {
        id: 'new-user-role',
        title: 'Papel (Role)',
        content: 'Define o nível de acesso: Coordenador vê apenas pessoas e encontros; Parish Admin tem acesso completo à paróquia; Setor/Diocese Admin gerenciam múltiplas paróquias.',
        placement: 'bottom',
      },
      {
        id: 'new-user-hierarchy',
        title: 'Vínculo Hierárquico',
        content: 'Associe o usuário à diocese, setor e/ou paróquia correta. O sistema mostrará apenas os níveis relevantes para o papel selecionado.',
        placement: 'bottom',
      },
    ],
  },

  // ─── Users — Detail/Edit ───────────────────────────────────────────────────
  '/app/users/[id]': {
    name: 'Editar Usuário',
    steps: [
      {
        id: 'user-detail-form',
        title: 'Editar Dados do Usuário',
        content: 'Altere nome, e-mail, papel e vínculo hierárquico. Deixe os campos de senha em branco para não alterá-la.',
        placement: 'bottom',
      },
      {
        id: 'user-detail-toggle-active',
        title: 'Ativar / Desativar Conta',
        content: 'Desativar uma conta bloqueia o acesso sem excluir o histórico do usuário. Use isso em vez de deletar para manter rastreabilidade.',
        placement: 'bottom',
      },
    ],
  },

  // ─── Dioceses — List ───────────────────────────────────────────────────────
  '/app/dioceses': {
    name: 'Dioceses',
    steps: [
      {
        id: 'dioceses-header',
        title: 'Gerenciamento de Dioceses',
        content: 'Dioceses são o nível mais alto da hierarquia. Cada diocese contém setores, que por sua vez contêm paróquias.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
      {
        id: 'dioceses-new-btn',
        title: 'Nova Diocese',
        content: 'Cria uma nova diocese. Após criar, você poderá adicionar setores a ela.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
      {
        id: 'dioceses-table',
        title: 'Lista de Dioceses',
        content: 'Clique em "Editar" para alterar o nome ou status de uma diocese. Desativar uma diocese não exclui os dados vinculados.',
        placement: 'top',
        roles: ['super_admin'],
      },
    ],
  },

  // ─── Dioceses — New ────────────────────────────────────────────────────────
  '/app/dioceses/new': {
    name: 'Criar Diocese',
    steps: [
      {
        id: 'new-diocese-form',
        title: 'Dados da Diocese',
        content: 'Informe o nome completo da diocese e defina se ela estará ativa. Dioceses inativas ficam ocultas para outros administradores.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
    ],
  },

  // ─── Dioceses — Detail ─────────────────────────────────────────────────────
  '/app/dioceses/[id]': {
    name: 'Editar Diocese',
    steps: [
      {
        id: 'diocese-detail-form',
        title: 'Editar Diocese',
        content: 'Altere o nome da diocese ou ative/desative-a. Alterações entram em vigor imediatamente.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
    ],
  },

  // ─── Sectors — List ────────────────────────────────────────────────────────
  '/app/sectors': {
    name: 'Setores',
    steps: [
      {
        id: 'sectors-header',
        title: 'Setores',
        content: 'Setores agrupam paróquias dentro de uma diocese. Um setor_admin gerencia todas as paróquias do seu setor.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
      {
        id: 'sectors-new-btn',
        title: 'Novo Setor',
        content: 'Cria um setor dentro da diocese atual. Informe o nome e a diocese à qual pertence.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
      {
        id: 'sectors-table',
        title: 'Lista de Setores',
        content: 'Clique em "Editar" para modificar o setor. Use os filtros para localizar setores por diocese ou status.',
        placement: 'top',
        roles: ['super_admin', 'diocese_admin'],
      },
    ],
  },

  // ─── Sectors — New / Detail ────────────────────────────────────────────────
  '/app/sectors/new': {
    name: 'Criar Setor',
    steps: [
      {
        id: 'new-sector-form',
        title: 'Dados do Setor',
        content: 'Informe o nome do setor e selecione a diocese à qual pertence.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
    ],
  },
  '/app/sectors/[id]': {
    name: 'Editar Setor',
    steps: [
      {
        id: 'sector-detail-form',
        title: 'Editar Setor',
        content: 'Altere nome, diocese vinculada e status do setor.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
    ],
  },

  // ─── Parishes — List ───────────────────────────────────────────────────────
  '/app/parishes': {
    name: 'Paróquias',
    steps: [
      {
        id: 'parishes-header',
        title: 'Paróquias',
        content: 'Paróquias são a unidade operacional do sistema. Cada paróquia tem seus próprios encontros, pessoas e usuários.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
      {
        id: 'parishes-new-btn',
        title: 'Nova Paróquia',
        content: 'Cria uma paróquia e a vincula a um setor. Após criar, você poderá configurar logo, cores e habilidades nas configurações da paróquia.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
      {
        id: 'parishes-filters',
        title: 'Filtros',
        content: 'Filtre por nome, diocese, setor ou status. Super-admin e diocese_admin veem filtros adicionais de hierarquia.',
        placement: 'bottom',
      },
      {
        id: 'parishes-table',
        title: 'Lista de Paróquias',
        content: 'Cada paróquia mostra seu logo, diocesse/setor e status. Clique em "Editar" para atualizar os dados.',
        placement: 'top',
      },
    ],
  },

  // ─── Parishes — New / Detail ───────────────────────────────────────────────
  '/app/parishes/new': {
    name: 'Criar Paróquia',
    steps: [
      {
        id: 'new-parish-form',
        title: 'Dados da Paróquia',
        content: 'Informe nome da paróquia, selecione diocese e setor em cascata. Logo e cores podem ser configurados depois nas Configurações.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
    ],
  },
  '/app/parishes/[id]': {
    name: 'Editar Paróquia',
    steps: [
      {
        id: 'parish-detail-form',
        title: 'Editar Paróquia',
        content: 'Altere nome, setor e status. Logo e cores são gerenciados pelo parish_admin nas Configurações.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
    ],
  },

  // ─── Settings — Parish ─────────────────────────────────────────────────────
  '/app/settings/parish': {
    name: 'Configurações da Paróquia',
    steps: [
      {
        id: 'settings-logo',
        title: 'Logo da Paróquia',
        content: 'Envie o logo que aparece na sidebar e nos relatórios PDF gerados pelo sistema.',
        placement: 'bottom',
        roles: ['parish_admin'],
      },
      {
        id: 'settings-colors',
        title: 'Cores da Marca',
        content: 'Defina a cor primária e secundária da sua paróquia. Use "Pré-visualizar" para ver como ficará antes de salvar.',
        placement: 'bottom',
        roles: ['parish_admin'],
      },
      {
        id: 'settings-skills',
        title: 'Habilidades Disponíveis',
        content: 'Cadastre as habilidades que podem ser atribuídas às pessoas. Exemplos: Música, Louvor, Culinária, Decoração. Essas habilidades alimentam as sugestões de IA.',
        placement: 'top',
        roles: ['parish_admin'],
      },
    ],
  },

  // ─── Audit ─────────────────────────────────────────────────────────────────
  '/app/audit': {
    name: 'Logs de Auditoria',
    steps: [
      {
        id: 'audit-header',
        title: 'Auditoria',
        content: 'Registra todas as ações críticas realizadas no sistema: criações, edições, exclusões e mudanças de status. Indispensável para rastrear alterações.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
      {
        id: 'audit-filters',
        title: 'Filtros de Data e Busca',
        content: 'Filtre logs por intervalo de datas ou por texto (nome do recurso, usuário, ação). Combine os filtros para investigações precisas.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin'],
      },
      {
        id: 'audit-table',
        title: 'Registros de Auditoria',
        content: 'Cada linha mostra: quando aconteceu, quem fez, qual ação e em qual recurso. As cores dos badges indicam o tipo de operação (criação, edição, exclusão).',
        placement: 'top',
        roles: ['super_admin', 'diocese_admin'],
      },
    ],
  },

  // ─── AI Logs ───────────────────────────────────────────────────────────────
  '/app/ai-logs': {
    name: 'Logs de IA',
    steps: [
      {
        id: 'ai-logs-stats',
        title: 'Estatísticas de Uso',
        content: 'Resumo do consumo da API Anthropic Claude: total de chamadas, tokens utilizados e custo estimado em dólares.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
      {
        id: 'ai-logs-filters',
        title: 'Filtros por Data',
        content: 'Selecione um intervalo de datas para analisar o consumo em períodos específicos. Útil para controle de orçamento mensal.',
        placement: 'bottom',
        roles: ['super_admin'],
      },
      {
        id: 'ai-logs-table',
        title: 'Detalhamento de Chamadas',
        content: 'Cada linha representa uma chamada à IA com: tipo de ação, tokens de entrada/saída, custo e status. Erros são destacados em vermelho.',
        placement: 'top',
        roles: ['super_admin'],
      },
    ],
  },

  // ─── Reports ───────────────────────────────────────────────────────────────
  '/app/reports': {
    name: 'Relatórios',
    steps: [
      {
        id: 'reports-header',
        title: 'Relatórios',
        content: 'Central de relatórios analíticos. Diocese e setor podem filtrar por paróquia. Os dados são calculados em tempo real.',
        placement: 'bottom',
      },
      {
        id: 'reports-parish-filter',
        title: 'Filtro de Escopo',
        content: 'Administradores de diocese e setor podem selecionar uma paróquia específica para isolar os dados nos gráficos.',
        placement: 'bottom',
        roles: ['super_admin', 'diocese_admin', 'sector_admin'],
      },
      {
        id: 'reports-engagement-chart',
        title: 'Gráfico de Engajamento',
        content: 'Distribuição histórica dos níveis de engajamento ao longo do tempo. Tendências de crescimento indicam saúde pastoral.',
        placement: 'top',
      },
      {
        id: 'reports-encounter-detail',
        title: 'Detalhamento por Encontro',
        content: 'Selecione um encontro específico para ver estatísticas detalhadas: score médio dos participantes, distribuição por equipes e comparação com edições anteriores.',
        placement: 'top',
      },
      {
        id: 'reports-export',
        title: 'Exportar Excel',
        content: 'Baixe todos os dados filtrados em uma planilha Excel para análise externa ou arquivo.',
        placement: 'bottom',
      },
    ],
  },
};

/**
 * Normalises a runtime pathname to the TUTORIALS map key.
 * Handles dynamic segments (UUIDs → [id]).
 *
 * Examples:
 *   /app/people/abc-123-def → /app/people/[id]
 *   /app/encounters/uuid/teams → /app/encounters/[id]/teams
 */
export function normalizeTutorialRoute(pathname: string): string {
  return pathname.replace(/\/[0-9a-f-]{8,}/gi, '/[id]');
}