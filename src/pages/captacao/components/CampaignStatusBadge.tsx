import type { CampaignStatus } from '../lib/captacaoApi'
import { CAMPAIGN_STATUS_CLASS, CAMPAIGN_STATUS_LABEL } from '../lib/captacaoFormat'

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${CAMPAIGN_STATUS_CLASS[status]}`}
    >
      {CAMPAIGN_STATUS_LABEL[status]}
    </span>
  )
}
