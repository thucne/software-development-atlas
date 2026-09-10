import type { AtlasIllustrationId } from '@/components/mdx/atlas-illustration';

export type LocalizedPhaseText = {
  en: string;
  vi: string;
};

export type PhaseNodeTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted';

export type PhaseNode = {
  id: string;
  label: LocalizedPhaseText;
  detail: LocalizedPhaseText;
  tone?: PhaseNodeTone;
};

export type InteractivePhase = {
  id: string;
  label: LocalizedPhaseText;
  summary: LocalizedPhaseText;
  /** Node ids emphasized in this phase; others stay visible but dimmed. */
  activeNodeIds: string[];
  /** Optional edge annotations between consecutive nodes. */
  edgeNotes?: Array<{
    afterNodeId: string;
    label: LocalizedPhaseText;
    tone?: PhaseNodeTone;
    broken?: boolean;
  }>;
};

export type InteractivePhaseIllustrationMedia = {
  kind: 'interactive-phases';
  title: LocalizedPhaseText;
  caption: LocalizedPhaseText;
  nodes: PhaseNode[];
  phases: InteractivePhase[];
  /** Auto-advance interval while playing. */
  autoPlayMs?: number;
};

const t = (en: string, vi: string): LocalizedPhaseText => ({ en, vi });

export const atlasInteractiveIllustrationMedia = {
  'payment-ambiguity-window': {
    kind: 'interactive-phases',
    title: t(
      'Payment ambiguity after a lost response',
      'Sự bất định thanh toán khi mất response',
    ),
    caption: t(
      'Step through the ambiguity window: a remote charge can succeed while the caller only sees a timeout.',
      'Đi từng bước qua cửa sổ bất định: charge phía xa có thể thành công trong khi caller chỉ thấy timeout.',
    ),
    autoPlayMs: 2600,
    nodes: [
      {
        id: 'api',
        label: t('Checkout API', 'Checkout API'),
        detail: t('Sends charge + idempotency key', 'Gửi charge + idempotency key'),
        tone: 'accent',
      },
      {
        id: 'provider',
        label: t('Payment provider', 'Nhà cung cấp thanh toán'),
        detail: t('May complete the charge', 'Có thể đã hoàn tất charge'),
        tone: 'success',
      },
      {
        id: 'response',
        label: t('Response path', 'Đường response'),
        detail: t('Success packet must return', 'Gói success phải quay về'),
        tone: 'muted',
      },
      {
        id: 'caller',
        label: t('Caller', 'Caller'),
        detail: t('Needs a confirmed outcome', 'Cần kết quả được xác nhận'),
        tone: 'muted',
      },
    ],
    phases: [
      {
        id: 'send',
        label: t('1 · Send', '1 · Gửi'),
        summary: t(
          'The API sends a charge request with an idempotency key. Nothing is ambiguous yet.',
          'API gửi charge kèm idempotency key. Chưa có gì bất định.',
        ),
        activeNodeIds: ['api', 'provider'],
        edgeNotes: [
          {
            afterNodeId: 'api',
            label: t('charge request', 'charge request'),
            tone: 'accent',
          },
        ],
      },
      {
        id: 'succeed',
        label: t('2 · Succeed', '2 · Thành công'),
        summary: t(
          'The provider can complete the charge successfully even before the caller learns the result.',
          'Provider có thể hoàn tất charge thành công trước khi caller biết kết quả.',
        ),
        activeNodeIds: ['provider'],
        edgeNotes: [
          {
            afterNodeId: 'provider',
            label: t('charge committed', 'charge đã commit'),
            tone: 'success',
          },
        ],
      },
      {
        id: 'lost',
        label: t('3 · Lost', '3 · Mất'),
        summary: t(
          'The success response is lost on the return path. The remote side effect still happened.',
          'Response thành công bị mất trên đường về. Side effect phía xa vẫn đã xảy ra.',
        ),
        activeNodeIds: ['response'],
        edgeNotes: [
          {
            afterNodeId: 'response',
            label: t('success packet lost', 'gói success bị mất'),
            tone: 'danger',
            broken: true,
          },
        ],
      },
      {
        id: 'timeout',
        label: t('4 · Timeout', '4 · Timeout'),
        summary: t(
          'The caller only sees a timeout. That means “unknown,” not “not charged.”',
          'Caller chỉ thấy timeout. Nghĩa là “không biết,” không phải “chưa trừ tiền.”',
        ),
        activeNodeIds: ['caller'],
      },
      {
        id: 'recover',
        label: t('5 · Recover', '5 · Khôi phục'),
        summary: t(
          'Safe recovery reuses the same idempotency key and reconciles remote state—never invent a failure from timeout alone.',
          'Khôi phục an toàn: dùng lại cùng idempotency key và reconcile trạng thái từ xa—không bịa failure chỉ từ timeout.',
        ),
        activeNodeIds: ['api', 'provider', 'caller'],
        edgeNotes: [
          {
            afterNodeId: 'api',
            label: t('same key + reconcile', 'cùng key + reconcile'),
            tone: 'accent',
          },
        ],
      },
    ],
  },
  'retry-storm-vs-jitter': {
    kind: 'interactive-phases',
    title: t('Retry storm vs full jitter', 'Retry storm so với full jitter'),
    caption: t(
      'Advance through recovery time to see synchronized retries spike together while jitter spreads load.',
      'Tiến theo thời gian phục hồi để thấy retry đồng bộ tạo đỉnh tải, còn jitter phân tán tải.',
    ),
    autoPlayMs: 2200,
    nodes: [
      {
        id: 'sync',
        label: t('Synchronized retries', 'Retry đồng loạt'),
        detail: t('Clients share the same backoff schedule', 'Client dùng cùng lịch backoff'),
        tone: 'danger',
      },
      {
        id: 'dependency',
        label: t('Recovering dependency', 'Dependency đang phục hồi'),
        detail: t('Limited capacity while healing', 'Năng lực hạn chế khi phục hồi'),
        tone: 'warning',
      },
      {
        id: 'jitter',
        label: t('Full jitter', 'Full jitter'),
        detail: t('Retry delays are randomized in the window', 'Độ trễ retry được random trong cửa sổ'),
        tone: 'success',
      },
    ],
    phases: [
      {
        id: 't0',
        label: t('t = 0s', 't = 0s'),
        summary: t(
          'Both populations start retries after the first failure. Load is still modest.',
          'Cả hai nhóm bắt đầu retry sau failure đầu. Tải vẫn vừa phải.',
        ),
        activeNodeIds: ['sync', 'dependency', 'jitter'],
        edgeNotes: [
          {
            afterNodeId: 'sync',
            label: t('~12 concurrent', '~12 đồng thời'),
            tone: 'warning',
          },
          {
            afterNodeId: 'dependency',
            label: t('~12 concurrent', '~12 đồng thời'),
            tone: 'success',
          },
        ],
      },
      {
        id: 't1',
        label: t('t = 1s', 't = 1s'),
        summary: t(
          'Synchronized clients return together and slam the dependency. Jitter has already spread.',
          'Client đồng bộ quay lại cùng lúc và đập vào dependency. Jitter đã phân tán.',
        ),
        activeNodeIds: ['sync', 'dependency', 'jitter'],
        edgeNotes: [
          {
            afterNodeId: 'sync',
            label: t('~86 concurrent spike', '~86 đỉnh đồng thời'),
            tone: 'danger',
          },
          {
            afterNodeId: 'dependency',
            label: t('~26 concurrent', '~26 đồng thời'),
            tone: 'success',
          },
        ],
      },
      {
        id: 't2',
        label: t('t = 2s', 't = 2s'),
        summary: t(
          'The storm peaks: almost everyone retries on the same tick. Jitter stays comparatively calm.',
          'Bão đạt đỉnh: gần như mọi client retry cùng nhịp. Jitter vẫn tương đối êm.',
        ),
        activeNodeIds: ['sync', 'dependency', 'jitter'],
        edgeNotes: [
          {
            afterNodeId: 'sync',
            label: t('~96 concurrent peak', '~96 đỉnh đồng thời'),
            tone: 'danger',
            broken: true,
          },
          {
            afterNodeId: 'dependency',
            label: t('~34 concurrent', '~34 đồng thời'),
            tone: 'success',
          },
        ],
      },
      {
        id: 't4',
        label: t('t = 4s', 't = 4s'),
        summary: t(
          'Synchronized retries remain high and keep re-injuring recovery. Jitter continues to breathe.',
          'Retry đồng bộ vẫn cao và tiếp tục làm tổn thương phục hồi. Jitter vẫn cho khoảng thở.',
        ),
        activeNodeIds: ['sync', 'dependency', 'jitter'],
        edgeNotes: [
          {
            afterNodeId: 'sync',
            label: t('~88 still high', '~88 vẫn cao'),
            tone: 'danger',
          },
          {
            afterNodeId: 'dependency',
            label: t('~30 concurrent', '~30 đồng thời'),
            tone: 'success',
          },
        ],
      },
      {
        id: 't8',
        label: t('t = 8s', 't = 8s'),
        summary: t(
          'Even late in the window, synchronized clients still arrive in waves. Jitter keeps recovery capacity usable.',
          'Ngay cả cuối cửa sổ, client đồng bộ vẫn đến theo đợt. Jitter giữ năng lực phục hồi dùng được.',
        ),
        activeNodeIds: ['sync', 'dependency', 'jitter'],
        edgeNotes: [
          {
            afterNodeId: 'sync',
            label: t('~74 wave remains', '~74 đợt vẫn còn'),
            tone: 'danger',
          },
          {
            afterNodeId: 'dependency',
            label: t('~22 concurrent', '~22 đồng thời'),
            tone: 'success',
          },
        ],
      },
    ],
  },
} satisfies Partial<
  Record<AtlasIllustrationId, InteractivePhaseIllustrationMedia>
>;
