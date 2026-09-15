export type ProposalEmailTemplateId =
  | 'autorizar_qv'
  | 'desbloquear_cadastro'
  | 'vincular_imovel'

export type ProposalEmailTemplateClientInput = {
  clientName: string
  clientCpf: string
  propertyCode: string
}

export type ProposalEmailTemplate = {
  id: ProposalEmailTemplateId
  buttonLabel: string
  subject: string
  buildText: (input: ProposalEmailTemplateClientInput) => string
}

export const DEFAULT_PROPOSAL_EMAIL_RECIPIENT = 'ag4551ce03@caixa.gov.br'

export const PROPOSAL_EMAIL_TEMPLATES: ProposalEmailTemplate[] = [
  {
    id: 'autorizar_qv',
    buttonLabel: 'Autorizar QV',
    subject: 'Autorizar QV',
    buildText: ({ clientName, clientCpf }) =>
      `Boa Tarde,\n\n${clientName.toUpperCase()}\n${clientCpf}\nAUTORIZAR QV\n\nAt,\nRafael Ribeiro`,
  },
  {
    id: 'desbloquear_cadastro',
    buttonLabel: 'Desbloquear Cadastro',
    subject: 'Desbloquear cadastro',
    buildText: ({ clientName, clientCpf }) =>
      `Bom Dia,\n\n${clientName}\n${clientCpf}\n\nAt,\nRafael Ribeiro`,
  },
  {
    id: 'vincular_imovel',
    buttonLabel: 'Vincular imóvel',
    subject: 'vincular imóvel',
    buildText: ({ propertyCode }) =>
      `Boa tarde,\n\nCódigo do Imóvel: ${propertyCode}\nCCA 000635448\n\nAt,\nRafael Ribeiro`,
  },
]
