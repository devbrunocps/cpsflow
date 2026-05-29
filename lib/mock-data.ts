import {
  Bot,
  Clock3,
  MessageCircle,
  Package,
  type LucideIcon,
} from "lucide-react";

export type Stat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  status: "Ativo" | "Pausado";
};

export type FlowStep = {
  id: string;
  title: string;
  message: string;
};

export type Flow = {
  id: string;
  name: string;
  trigger: string;
  status: "Ativo" | "Rascunho";
  steps: FlowStep[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export const dashboardStats: Stat[] = [
  {
    label: "Status do bot",
    value: "Online",
    helper: "Respondendo clientes em tempo real",
    icon: Bot,
  },
  {
    label: "Mensagens configuradas",
    value: "18",
    helper: "FAQ, saudacoes e respostas de fluxo",
    icon: MessageCircle,
  },
  {
    label: "Produtos cadastrados",
    value: "6",
    helper: "4 ativos e 2 pausados",
    icon: Package,
  },
  {
    label: "Horario atual",
    value: "08h as 18h",
    helper: "Segunda a sexta-feira",
    icon: Clock3,
  },
];

export const recentConversations = [
  {
    customer: "Mariana Alves",
    channel: "WhatsApp",
    intent: "Perguntou sobre planos mensais",
    status: "Respondido",
    time: "Ha 4 min",
  },
  {
    customer: "Ricardo Lima",
    channel: "WhatsApp",
    intent: "Solicitou preco de consultoria",
    status: "Em fluxo",
    time: "Ha 12 min",
  },
  {
    customer: "Clara Nunes",
    channel: "WhatsApp",
    intent: "Pediu formas de pagamento",
    status: "Respondido",
    time: "Ha 28 min",
  },
];

export const products: Product[] = [
  {
    id: "prd-1",
    name: "Plano Essencial",
    description: "Atendimento automatico para pequenas equipes.",
    price: "R$ 149,00",
    status: "Ativo",
  },
  {
    id: "prd-2",
    name: "Plano Profissional",
    description: "Fluxos ilimitados, FAQ completo e relatorios.",
    price: "R$ 299,00",
    status: "Ativo",
  },
  {
    id: "prd-3",
    name: "Consultoria de Implantacao",
    description: "Configuracao inicial do bot e treinamento do time.",
    price: "R$ 850,00",
    status: "Pausado",
  },
];

export const flows: Flow[] = [
  {
    id: "flow-1",
    name: "Boas-vindas",
    trigger: "Primeira mensagem",
    status: "Ativo",
    steps: [
      {
        id: "step-1",
        title: "Saudacao inicial",
        message:
          "Ola! Sou o atendente virtual da CPS. Como posso te ajudar hoje?",
      },
      {
        id: "step-2",
        title: "Menu principal",
        message:
          "Digite 1 para produtos, 2 para horarios ou 3 para falar com uma pessoa.",
      },
    ],
  },
  {
    id: "flow-2",
    name: "Orcamento rapido",
    trigger: "Palavra-chave: preco",
    status: "Rascunho",
    steps: [
      {
        id: "step-3",
        title: "Coleta de interesse",
        message: "Me conta qual produto ou servico voce quer cotar?",
      },
      {
        id: "step-4",
        title: "Encaminhamento",
        message:
          "Perfeito. Vou enviar seu pedido para nosso time comercial agora.",
      },
    ],
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "Qual e o horario de atendimento?",
    answer: "Atendemos de segunda a sexta, das 08h as 18h.",
    category: "Horario",
  },
  {
    id: "faq-2",
    question: "Onde fica a empresa?",
    answer: "Estamos em Sao Paulo, com atendimento remoto para todo o Brasil.",
    category: "Endereco",
  },
  {
    id: "faq-3",
    question: "Quais formas de pagamento aceitam?",
    answer: "Aceitamos Pix, boleto e cartao de credito.",
    category: "Pagamento",
  },
];
