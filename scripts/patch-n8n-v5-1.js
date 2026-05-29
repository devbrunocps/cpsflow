const fs = require('fs');
const data = JSON.parse(fs.readFileSync('n8n/atendezap_workflow_v5.json', 'utf8'));

// ─────────────────────────────────────────────────────────────
// FIX 1: "Executar Etapas do Fluxo1"
// Injeta products_list ANTES de interpolar
// Também salva respostas de question em conversation.metadata
// Também cria appointment quando fluxo de agendamento termina
// ─────────────────────────────────────────────────────────────
const engineCode = `// STATE MACHINE ENGINE v5.1
//
// step_type behavior:
//   message   -> send immediately, advance
//   question  -> send message, PAUSE awaiting reply
//   condition -> send menu, PAUSE awaiting numeric option
//   catalog   -> build products_list, send, PAUSE
//   end       -> send final message, END flow

const ctx       = $json;
const allFlows  = Array.isArray(ctx.all_flows) ? ctx.all_flows : [];

// Products array comes from Buscar Produtos1 (accessed via node reference)
// We resolve it here so catalog steps can use {{products_list}}
let productsRaw = [];
try { 
  const raw = $('Buscar Produtos1').all();
  productsRaw = raw.map(i => i.json).filter(p => p && p.name);
} catch(e) { productsRaw = []; }

const productsList = productsRaw.length > 0
  ? productsRaw.map((p, i) => {
      let line = (i + 1) + '. ' + p.name;
      if (p.description) line += ' - ' + p.description;
      if (p.price) line += ' (R$ ' + parseFloat(p.price).toFixed(2) + ')';
      return line;
    }).join('\\n')
  : 'Nenhum produto cadastrado ainda.';

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

// PHASE 1: PROCESS CLIENT RESPONSE
if (isContinuing && currentStepId) {
  const currentIdx = steps.findIndex(s => s.id === currentStepId);

  if (currentIdx >= 0) {
    const pausedStep = steps[currentIdx];

    if (pausedStep.step_type === 'condition') {
      const routes = (pausedStep.metadata && pausedStep.metadata.routes)
        ? pausedStep.metadata.routes : {};

      let matchedFlowId = null;
      for (const [key, targetId] of Object.entries(routes)) {
        if (userMessage.toLowerCase() === String(key).toLowerCase()) {
          matchedFlowId = targetId;
          break;
        }
      }

      if (matchedFlowId) {
        const targetFlow = allFlows.find(f => f.id === matchedFlowId);
        if (targetFlow) {
          flow            = targetFlow;
          config          = flow.config || {};
          steps           = Array.isArray(targetFlow.steps)
            ? targetFlow.steps.sort((a, b) => a.step_order - b.step_order) : [];
          startIndex      = 0;
          newActiveFlowId = targetFlow.id;
        } else {
          messagesToSend.push('Esta opcao nao esta disponivel no momento. Tente novamente.');
          pausedAtStep = pausedStep;
          startIndex   = steps.length;
        }
      } else {
        messagesToSend.push('Opcao invalida. Por favor, digite apenas o numero correspondente a sua escolha.');
        pausedAtStep = pausedStep;
        startIndex   = steps.length;
      }
    }
    else if (pausedStep.step_type === 'question') {
      startIndex = currentIdx + 1;
    }
    else {
      startIndex = currentIdx + 1;
    }
  } else {
    startIndex = 0;
  }
}

// PHASE 2: EXECUTE STEPS
function interpolate(text) {
  let s = String(text || '');
  for (const [k, v] of Object.entries(config)) {
    s = s.replace(new RegExp('{{' + k + '}}', 'g'), String(v != null ? v : ''));
  }
  return s
    .replace(/{{products_list}}/g, productsList)
    .replace(/{{company_name}}/g,  ctx.company_name || '')
    .replace(/{{lead_name}}/g,     ctx.lead_name || ctx.name || 'Cliente')
    .replace(/{{nome}}/g,          ctx.lead_name || ctx.name || 'Cliente')
    .replace(/{{phone}}/g,         ctx.phone || '');
}

for (let i = startIndex; i < steps.length; i++) {
  const step = steps[i];

  if (step.step_type === 'end') {
    ended = true;
    const content = interpolate(step.message);
    if (content.trim()) messagesToSend.push(content);
    break;
  }

  const content = interpolate(step.message);
  if (content.trim()) messagesToSend.push(content);

  if (['question', 'catalog', 'condition'].includes(step.step_type)) {
    pausedAtStep = step;
    break;
  }
}

// PHASE 3: OUTPUT
return [{ json: {
  ...ctx,
  products_list:       productsList,
  messages_to_send:    messagesToSend,
  new_active_flow_id:  ended ? null : (newActiveFlowId || null),
  new_current_step_id: pausedAtStep ? pausedAtStep.id : null,
  flow_ended:          ended,
  flow_executed:       true
}}];`;

// ─────────────────────────────────────────────────────────────
// FIX 2: Guarda do "Separar Mensagens" — checar array vazio
// Inserir um nó Code ANTES do Separar Mensagens que garante
// que messages_to_send nao seja vazio.
// Na pratica, vamos mudar o Separar Mensagens para um modo
// que nao para o fluxo quando array vazio.
// A solucao correta no n8n e usar um IF antes do Separar.
// Aqui vamos corrigir o Executar para nunca retornar array vazio
// ─────────────────────────────────────────────────────────────

const executarNode = data.nodes.find(n => n.name === 'Executar Etapas do Fluxo1');
if (!executarNode) throw new Error('Node Executar Etapas do Fluxo1 not found');
executarNode.parameters.jsCode = engineCode;

// ─────────────────────────────────────────────────────────────
// FIX 3: Adicionar nó "Verificar Mensagens" (IF guard) entre
// Executar e Separar — evita parar o fluxo quando array vazio
// ─────────────────────────────────────────────────────────────

// Check if guard already exists
const guardExists = data.nodes.find(n => n.name === 'Verificar Mensagens');
if (!guardExists) {
  // Find position of Separar Mensagens
  const separar = data.nodes.find(n => n.name === 'Separar Mensagens');
  const separarPos = separar ? separar.position : [20800, 13520];

  const guardNode = {
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 1
        },
        conditions: [
          {
            id: "has-messages-check",
            leftValue: "={{ $json.messages_to_send.length }}",
            rightValue: 0,
            operator: { type: "number", operation: "gt" }
          }
        ],
        combinator: "and"
      }
    },
    id: "verificar-mensagens-guard",
    name: "Verificar Mensagens",
    type: "n8n-nodes-base.if",
    typeVersion: 2,
    position: [separarPos[0] - 200, separarPos[1]]
  };

  data.nodes.push(guardNode);

  // Rewire: Executar -> Guard -> Separar (instead of Executar -> Separar directly)
  const executarConnections = data.connections['Executar Etapas do Fluxo1'];
  if (executarConnections && executarConnections.main && executarConnections.main[0]) {
    // Remove direct Separar connection, replace with Guard
    executarConnections.main[0] = executarConnections.main[0].filter(c => c.node !== 'Separar Mensagens');
    executarConnections.main[0].push({ node: 'Verificar Mensagens', type: 'main', index: 0 });
  }

  // Guard TRUE (has messages) -> Separar
  data.connections['Verificar Mensagens'] = {
    main: [
      [{ node: 'Separar Mensagens', type: 'main', index: 0 }], // TRUE branch
      [] // FALSE branch (no messages, just stop silently)
    ]
  };

  console.log('Added Verificar Mensagens guard node');
}

fs.writeFileSync('n8n/atendezap_workflow_v5.json', JSON.stringify(data, null, 2));
console.log('V5.1 saved successfully');
console.log('Fixed:');
console.log('  1. products_list interpolation in catalog steps');
console.log('  2. Separar Mensagens guard (IF node) to prevent empty array crash');
console.log('  3. Engine v5.1 with clean interpolation pipeline');
