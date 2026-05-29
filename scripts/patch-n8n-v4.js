const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../n8n/atendezap_workflow_v3.json');
const outputPath = path.join(__dirname, '../n8n/atendezap_workflow_v4.json');

const flowData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const nodes = flowData.nodes;

function findNode(name) {
  return nodes.find(n => n.name === name);
}

// Update Executar Etapas do Fluxo to handle Condition logic
const executarEtapas = findNode("Executar Etapas do Fluxo");
if (executarEtapas) {
  executarEtapas.parameters.jsCode = `const ctx = $json;
const flows = $("Buscar Fluxos Ativos").first().json; // we need access to all flows to resolve the target flow!
const flowsArr = Array.isArray(flows) ? flows : [flows];

let steps = ctx.flow_steps || [];
let flow = ctx.active_flow || {};
const config = flow.config || {};
const isContinuing = ctx.is_continuing;
const currentStepId = ctx.current_flow_step_id;
const userMessage = String(ctx.message || "").trim();

let startIndex = 0;
let messagesToSend = [];
let pausedAtStep = null;
let ended = false;
let newActiveFlowId = flow.id;
let isInvalidOption = false;

if (isContinuing && currentStepId) {
  const currentIdx = steps.findIndex(s => s.id === currentStepId);
  if (currentIdx >= 0) {
    const pausedStep = steps[currentIdx];
    
    // CONDITION LOGIC
    if (pausedStep.step_type === "condition") {
      const routes = (pausedStep.metadata && pausedStep.metadata.routes) ? pausedStep.metadata.routes : {};
      
      // Find a matching route (case insensitive, exact match or starts with)
      let matchedFlowId = null;
      for (const [key, targetId] of Object.entries(routes)) {
        if (userMessage.toLowerCase() === String(key).toLowerCase() || userMessage.toLowerCase().startsWith(String(key).toLowerCase() + " ")) {
          matchedFlowId = targetId;
          break;
        }
      }
      
      if (matchedFlowId) {
        // Switch to the new flow!
        const targetFlow = flowsArr.find(f => f.id === matchedFlowId);
        if (targetFlow) {
          flow = targetFlow;
          steps = Array.isArray(targetFlow.steps) ? targetFlow.steps.sort((a, b) => a.step_order - b.step_order) : [];
          startIndex = 0; // Start the new flow from the beginning!
          newActiveFlowId = targetFlow.id;
        } else {
          // Flow not found
          isInvalidOption = true;
        }
      } else {
        // No match
        isInvalidOption = true;
      }
      
      if (isInvalidOption) {
        messagesToSend.push("Desculpe, opção inválida. Por favor, tente novamente.");
        pausedAtStep = pausedStep; // Stay paused here
        startIndex = steps.length; // Skip loop execution
      }
    } else {
      // It was a normal question, just proceed
      startIndex = currentIdx + 1;
    }
  }
}

// MAIN EXECUTION LOOP
for (let i = startIndex; i < steps.length; i++) {
  const step = steps[i];
  
  if (step.step_type === "end") {
    ended = true;
    let content = String(step.message || "");
    if (content.trim()) messagesToSend.push(content);
    break;
  }
  
  let content = String(step.message || "");
  for (const [key, val] of Object.entries(config)) {
    content = content.replace(new RegExp("{{" + key + "}}", "g"), String(val));
  }
  content = content
    .replace(/{{company_name}}/g, ctx.company_name || "")
    .replace(/{{lead_name}}/g, ctx.lead_name || ctx.name || "Cliente")
    .replace(/{{nome}}/g, ctx.lead_name || ctx.name || "Cliente");
    
  if (content.trim()) {
    messagesToSend.push(content);
  }
  
  if (step.step_type === "question" || step.step_type === "catalog" || step.step_type === "condition") {
    pausedAtStep = step;
    break; 
  }
}

// FALLBACK FOR EMPTY QUESTIONS
if (messagesToSend.length === 0 && !ended && pausedAtStep && !isInvalidOption) {
  // Edge case: if a question/condition step has no text
  if (pausedAtStep.step_type === "condition") {
    messagesToSend.push("Por favor, selecione uma opção.");
  } else {
    messagesToSend.push("Por favor, responda à pergunta.");
  }
}

const payload = { 
  ...ctx,
  messages_to_send: messagesToSend,
  new_active_flow_id: ended ? null : newActiveFlowId,
  new_current_step_id: pausedAtStep ? pausedAtStep.id : null,
  flow_executed: true
};

return [{ json: payload }];`;
}

// Ensure Buscar Fluxos Ativos is accessible:
// The code `$("Buscar Fluxos Ativos").first().json` assumes that node has executed and its output is available.
// In the current workflow, Buscar Fluxos Ativos executes BEFORE Decidir Fluxo ou IA, so it's globally available.

fs.writeFileSync(outputPath, JSON.stringify(flowData, null, 2), 'utf8');
console.log('Successfully created atendezap_workflow_v4.json');
