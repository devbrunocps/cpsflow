const fs = require('fs');
const data = JSON.parse(fs.readFileSync('n8n/atendezap_workflow_v4.json', 'utf8'));

// ═══════════════════════════════════════════════════════════
// NODE 1: Decidir Fluxo ou IA - State Machine Router v5
// ═══════════════════════════════════════════════════════════
const decidirCode = `// STATE MACHINE ROUTER v5
// Prioridade de decisão:
//   1. Contexto ativo (active_flow_id) -> continua fluxo
//   2. Gatilho first_message           -> novo fluxo
//   3. Gatilho keyword                 -> novo fluxo
//   4. Nenhum match                    -> use_ai = true

const ctx      = $('Consolidar Conversa1').first().json;
const allItems = $input.all();

// Todos os fluxos ativos (cada item = 1 fluxo do Supabase)
const flows  = allItems.map(i => i.json).filter(f => f && f.id);
const msgLower = String(ctx.message || '').toLowerCase().trim();

// PRIORIDADE 1: Cliente ja esta no meio de um fluxo?
// Se sim, NAO tenta keyword matching. Continua de onde parou.
if (ctx.active_flow_id) {
  const activeFlow = flows.find(f => f.id === ctx.active_flow_id);
  if (activeFlow) {
    const steps = Array.isArray(activeFlow.steps)
      ? activeFlow.steps.sort((a, b) => a.step_order - b.step_order)
      : [];
    return [{ json: {
      ...ctx,
      active_flow:  activeFlow,
      all_flows:    flows,
      flow_steps:   steps,
      use_ai:       false,
      is_continuing: true
    }}];
  }
  // active_flow_id existe mas fluxo foi deletado/desativado - cai no matching abaixo
}

// PRIORIDADE 2 e 3: Tenta acionar novo fluxo por trigger
const sorted = [...flows].sort((a, b) => (a.priority || 10) - (b.priority || 10));

for (const flow of sorted) {
  const keywords    = flow.trigger_keywords || [];
  const triggerType = flow.trigger_type || 'keyword';
  const steps       = Array.isArray(flow.steps)
    ? flow.steps.sort((a, b) => a.step_order - b.step_order)
    : [];

  if (steps.length === 0) continue;

  // first_message: so na primeira mensagem de uma conversa nova
  if (triggerType === 'first_message') {
    if (ctx.is_new_conversation === true && ctx.is_new_lead === true) {
      return [{ json: {
        ...ctx,
        active_flow:   flow,
        all_flows:     flows,
        flow_steps:    steps,
        use_ai:        false,
        is_continuing: false
      }}];
    }
    continue;
  }

  // keyword: mensagem contem alguma palavra-chave
  if (triggerType === 'keyword' && keywords.length > 0) {
    const hit = keywords.some(kw => msgLower.includes(String(kw).toLowerCase().trim()));
    if (hit) {
      return [{ json: {
        ...ctx,
        active_flow:   flow,
        all_flows:     flows,
        flow_steps:    steps,
        use_ai:        false,
        is_continuing: false
      }}];
    }
  }
}

// PRIORIDADE 4: sem match -> usa IA
return [{ json: {
  ...ctx,
  active_flow:   null,
  all_flows:     flows,
  flow_steps:    [],
  use_ai:        true,
  is_continuing: false
}}];`;

// ═══════════════════════════════════════════════════════════
// NODE 2: Executar Etapas do Fluxo1 - State Machine Engine v5
// ═══════════════════════════════════════════════════════════
const executarCode = `// STATE MACHINE ENGINE v5
//
// Tipos de etapa e comportamento:
//   message   -> envia imediatamente, AVANCA para o proximo
//   question  -> envia mensagem, PAUSA aguardando resposta
//   condition -> envia menu, PAUSA aguardando opcao numerica
//                ao retornar: valida routes e TROCA o fluxo ativo
//   catalog   -> envia intro, PAUSA (o front envia o catalogo)
//   end       -> envia mensagem final, ENCERRA o fluxo

const ctx          = $json;
const allFlows     = Array.isArray(ctx.all_flows) ? ctx.all_flows : [];

let steps          = Array.isArray(ctx.flow_steps) ? ctx.flow_steps : [];
let flow           = ctx.active_flow || {};
let config         = flow.config || {};
let isContinuing   = ctx.is_continuing === true;
let currentStepId  = ctx.current_flow_step_id || null;
let userMessage    = String(ctx.message || '').trim();

let startIndex     = 0;
let messagesToSend = [];
let pausedAtStep   = null;
let ended          = false;
let newActiveFlowId = flow.id || null;

// FASE 1: PROCESSAR RESPOSTA DO CLIENTE
if (isContinuing && currentStepId) {
  const currentIdx = steps.findIndex(s => s.id === currentStepId);

  if (currentIdx >= 0) {
    const pausedStep = steps[currentIdx];

    // CONDITION: valida opcao do menu e roteia para sub-fluxo
    if (pausedStep.step_type === 'condition') {
      const routes = (pausedStep.metadata && pausedStep.metadata.routes)
        ? pausedStep.metadata.routes
        : {};

      let matchedFlowId = null;
      const userLower   = userMessage.toLowerCase();

      for (const [key, targetId] of Object.entries(routes)) {
        if (userLower === String(key).toLowerCase()) {
          matchedFlowId = targetId;
          break;
        }
      }

      if (matchedFlowId) {
        // Opcao valida -> trocar para o sub-fluxo
        const targetFlow = allFlows.find(f => f.id === matchedFlowId);
        if (targetFlow) {
          flow            = targetFlow;
          config          = flow.config || {};
          steps           = Array.isArray(targetFlow.steps)
            ? targetFlow.steps.sort((a, b) => a.step_order - b.step_order)
            : [];
          startIndex      = 0;
          newActiveFlowId = targetFlow.id;
        } else {
          // Fluxo alvo nao encontrado (deletado?)
          messagesToSend.push('Desculpe, esta opcao nao esta disponivel no momento. Tente novamente.');
          pausedAtStep = pausedStep;
          startIndex   = steps.length;
        }
      } else {
        // Opcao digitada nao existe no menu
        messagesToSend.push('Opcao invalida. Por favor, digite apenas o numero correspondente a sua escolha.');
        pausedAtStep = pausedStep;
        startIndex   = steps.length;
      }
    }
    // QUESTION: cliente respondeu a pergunta, avanca
    else if (pausedStep.step_type === 'question') {
      startIndex = currentIdx + 1;
    }
    // CATALOG / outros: avanca
    else {
      startIndex = currentIdx + 1;
    }
  } else {
    // currentStepId nao existe mais (fluxo foi editado?) -> recomecar
    startIndex = 0;
  }
}

// FASE 2: EXECUTAR STEPS DO FLUXO
function interpolate(text) {
  let s = String(text || '');
  for (const [k, v] of Object.entries(config)) {
    s = s.replace(new RegExp('{{' + k + '}}', 'g'), String(v != null ? v : ''));
  }
  return s
    .replace(/{{company_name}}/g, ctx.company_name || '')
    .replace(/{{lead_name}}/g,    ctx.lead_name || ctx.name || 'Cliente')
    .replace(/{{nome}}/g,         ctx.lead_name || ctx.name || 'Cliente')
    .replace(/{{phone}}/g,        ctx.phone || '');
}

for (let i = startIndex; i < steps.length; i++) {
  const step = steps[i];

  // END -> encerra fluxo
  if (step.step_type === 'end') {
    ended = true;
    const content = interpolate(step.message);
    if (content.trim()) messagesToSend.push(content);
    break;
  }

  // Interpola e enfileira mensagem
  const content = interpolate(step.message);
  if (content.trim()) messagesToSend.push(content);

  // Tipos que PAUSAM aguardando resposta do cliente
  if (['question', 'catalog', 'condition'].includes(step.step_type)) {
    pausedAtStep = step;
    break;
  }
  // 'message' -> continua automaticamente para o proximo step
}

// FASE 3: EMPACOTA SAIDA
return [{ json: {
  ...ctx,
  messages_to_send:    messagesToSend,
  new_active_flow_id:  ended ? null : (newActiveFlowId || null),
  new_current_step_id: pausedAtStep ? pausedAtStep.id : null,
  flow_ended:          ended,
  flow_executed:       true
}}];`;

// Aplicar nos nós
const decidirNode  = data.nodes.find(n => n.name === 'Decidir Fluxo ou IA');
const executarNode = data.nodes.find(n => n.name === 'Executar Etapas do Fluxo1');

if (!decidirNode)  throw new Error('Node "Decidir Fluxo ou IA" not found');
if (!executarNode) throw new Error('Node "Executar Etapas do Fluxo1" not found');

decidirNode.parameters.jsCode  = decidirCode;
executarNode.parameters.jsCode = executarCode;

fs.writeFileSync('n8n/atendezap_workflow_v5.json', JSON.stringify(data, null, 2));
console.log('V5 gerado com sucesso!');
console.log('Nos refatorados:');
console.log('  - Decidir Fluxo ou IA');
console.log('  - Executar Etapas do Fluxo1');
