import type { AtlasIllustrationId } from '@/components/mdx/atlas-illustration';

export type LocalizedIllustrationText = {
  en: string;
  vi: string;
};

export type StaticTeachingIllustrationMedia = {
  kind: 'static-image';
  title: LocalizedIllustrationText;
  caption: LocalizedIllustrationText;
  description: LocalizedIllustrationText;
  asset:
    | `/illustrations/${string}.webp`
    | `/illustrations/${string}.svg`;
};

const t = (en: string, vi: string): LocalizedIllustrationText => ({ en, vi });

export const atlasStaticIllustrationMedia = {
  'bounded-concurrency': {
    kind: 'static-image',
    title: t('Bounded concurrency protects downstream capacity', 'Concurrency có giới hạn bảo vệ năng lực downstream'),
    caption: t('A large backlog can wait while only a fixed number of jobs actively consume downstream capacity.', 'Một backlog lớn có thể chờ trong khi chỉ một số lượng job cố định chủ động sử dụng năng lực downstream.'),
    description: t('A large backlog narrows through five active worker lanes before reaching one downstream service, showing that queued jobs wait while active concurrency stays bounded.', 'Một backlog lớn thu hẹp qua năm lane worker đang hoạt động trước khi đến một dịch vụ downstream, cho thấy job trong queue chờ trong khi concurrency đang hoạt động vẫn được giới hạn.'),
    asset: '/illustrations/async/bounded-concurrency.svg',
  },
  'main-thread-starvation': {
    kind: 'static-image',
    title: t('Self-replenishing microtasks can starve later work', 'Microtask tự bổ sung có thể làm các công việc sau bị starvation'),
    caption: t('When microtasks keep adding microtasks, input, rendering, and later tasks can wait even when each microtask is small.', 'Khi microtask liên tục thêm microtask mới, input, rendering và các task phía sau có thể phải chờ dù từng microtask riêng lẻ rất nhỏ.'),
    description: t('A main-thread lane is filled by a continuously replenishing stream of microtasks while user input, rendering work, and later tasks remain queued behind it.', 'Một lane main thread bị lấp đầy bởi luồng microtask liên tục tự bổ sung, trong khi input người dùng, công việc rendering và các task phía sau vẫn phải xếp hàng chờ.'),
    asset: '/illustrations/async/main-thread-starvation.svg',
  },
  'request-boundary-ownership': {
    kind: 'static-image',
    title: t('A request may stop at an earlier ownership boundary', 'Một request có thể dừng ở một boundary sở hữu sớm hơn'),
    caption: t('Client cache, intermediary, gateway, or origin can answer; later boundaries may never participate.', 'Client cache, intermediary, gateway hoặc origin đều có thể trả lời; các boundary phía sau có thể không bao giờ tham gia.'),
    description: t('A request crosses a sequence of possible ownership boundaries, with earlier responders highlighted to show that later layers can be skipped entirely.', 'Một request đi qua chuỗi boundary sở hữu khả dĩ, trong đó các điểm trả lời sớm được nhấn mạnh để cho thấy những layer phía sau có thể bị bỏ qua hoàn toàn.'),
    asset: '/illustrations/http/request-boundary-ownership.svg',
  },
  'cold-vs-warm-start': {
    kind: 'static-image',
    title: t('Cold paths create capacity before serving work', 'Cold path phải tạo năng lực trước khi phục vụ công việc'),
    caption: t('A cold execution environment pays initialization work; a warm one reuses existing capacity.', 'Execution environment lạnh phải trả chi phí khởi tạo; execution environment ấm tái sử dụng năng lực đã có.'),
    description: t('The cold path passes through several initialization stages before an execution environment can serve work, while the warm path reaches an already available environment directly.', 'Cold path đi qua nhiều bước khởi tạo trước khi execution environment có thể phục vụ công việc, còn warm path đi thẳng đến một environment đã sẵn sàng.'),
    asset: '/illustrations/cloud/cold-vs-warm-start.svg',
  },
  'serverless-downstream-avalanche': {
    kind: 'static-image',
    title: t('Autoscaling can overwhelm a smaller downstream boundary', 'Autoscaling có thể làm quá tải một downstream boundary nhỏ hơn'),
    caption: t('Compute concurrency can expand faster than database or API connection capacity.', 'Compute concurrency có thể tăng nhanh hơn năng lực connection của database hoặc API.'),
    description: t('Many rapidly multiplying compute workers converge on a much smaller downstream database, whose capacity boundary is highlighted as overloaded.', 'Nhiều compute worker tăng nhanh cùng hội tụ vào một database downstream nhỏ hơn nhiều, với boundary năng lực của database được nhấn mạnh là đang quá tải.'),
    asset: '/illustrations/cloud/serverless-downstream-avalanche.svg',
  },
  'hydration-gap': {
    kind: 'static-image',
    title: t('Visible HTML can precede interactive behavior', 'HTML hiển thị có thể xuất hiện trước hành vi tương tác'),
    caption: t('Server-rendered content may already be visible while the client runtime is still attaching behavior.', 'Nội dung render từ server có thể đã hiển thị trong khi client runtime vẫn đang gắn hành vi tương tác.'),
    description: t('A browser already shows a complete interface while a separate client runtime connects to still-inactive controls, emphasizing the visible-but-not-yet-interactive interval.', 'Trình duyệt đã hiển thị một giao diện hoàn chỉnh trong khi client runtime riêng đang kết nối vào các control chưa hoạt động, nhấn mạnh khoảng thời gian đã thấy nội dung nhưng chưa tương tác được.'),
    asset: '/illustrations/rendering/hydration-gap.svg',
  },
  'hybrid-rendering-architecture': {
    kind: 'static-image',
    title: t('One product surface can mix rendering models', 'Một product surface có thể kết hợp nhiều mô hình rendering'),
    caption: t('Shared static, request-time server-rendered, and long-lived client-rendered regions can coexist.', 'Các vùng static dùng chung, server-rendered theo request và client-rendered dài hạn có thể cùng tồn tại.'),
    description: t('One page surface is divided into shared static, request-time server-rendered, and client-rendered regions fed by different sources, showing that rendering strategies can coexist.', 'Một page surface được chia thành các vùng static dùng chung, server-rendered theo request và client-rendered được cấp dữ liệu từ những nguồn khác nhau, cho thấy các chiến lược rendering có thể cùng tồn tại.'),
    asset: '/illustrations/rendering/hybrid-rendering-architecture.svg',
  },
  'architecture-boundary-comparison': {
    kind: 'static-image',
    title: t('Deployment boundaries differ from code-quality boundaries', 'Deployment boundary khác với boundary về chất lượng code'),
    caption: t('A monolith shares one deployable; a modular monolith adds internal compartments; microservices add independently deployed boundaries.', 'Monolith dùng chung một deployable; modular monolith thêm compartment nội bộ; microservices thêm các boundary deploy độc lập.'),
    description: t('Three side-by-side architectures show one shared deployment boundary, one shared boundary with explicit internal compartments, and several independently separated service boundaries.', 'Ba kiến trúc đặt cạnh nhau cho thấy một deployment boundary dùng chung, một boundary dùng chung có compartment nội bộ rõ ràng và nhiều service boundary được tách độc lập.'),
    asset: '/illustrations/architecture/architecture-boundary-comparison.svg',
  },
  'blast-radius-comparison': {
    kind: 'static-image',
    title: t('Isolation can reduce a failure boundary without removing dependencies', 'Isolation có thể giảm failure boundary nhưng không loại bỏ dependency'),
    caption: t('A shared failure can affect many components; isolated services can contain some faults while dependency failures still cross boundaries.', 'Một failure dùng chung có thể ảnh hưởng nhiều component; service tách biệt có thể chứa một số lỗi dù failure qua dependency vẫn có thể vượt boundary.'),
    description: t('A broad failure cloud covers many tightly shared components on one side, while the other side contains one failed isolated service alongside healthy services that still retain dependency links.', 'Một vùng failure rộng bao phủ nhiều component dùng chung chặt chẽ ở một phía, trong khi phía còn lại cô lập một service lỗi bên cạnh các service khỏe vẫn còn những dependency link.'),
    asset: '/illustrations/architecture/blast-radius-comparison.svg',
  },
  'distributed-monolith': {
    kind: 'static-image',
    title: t('Network boundaries do not guarantee independence', 'Network boundary không đảm bảo tính độc lập'),
    caption: t('Dense cross-service dependencies can recreate monolithic coordination while adding distributed failure modes.', 'Dependency dày đặc giữa các service có thể tái tạo việc điều phối kiểu monolith đồng thời thêm failure mode phân tán.'),
    description: t('Several separate services are connected by a dense mesh of cross-service dependencies and release paths, visually showing distributed deployment without real independence.', 'Nhiều service tách rời được nối bởi một mạng dày đặc các dependency và release path xuyên service, trực quan hóa việc deploy phân tán nhưng không có tính độc lập thực sự.'),
    asset: '/illustrations/architecture/distributed-monolith.svg',
  },
  'payment-ambiguity-window': {
    kind: 'static-image',
    title: t('The remote side effect can succeed while the response is lost', 'Side effect ở remote có thể thành công trong khi response bị mất'),
    caption: t('A timeout tells the caller it lacks confirmation; it does not prove the payment failed.', 'Timeout cho biết caller không có xác nhận; nó không chứng minh payment đã thất bại.'),
    description: t('A payment request reaches the provider and completes successfully, but the returning success path is visibly broken before it reaches the calling API, leaving the caller uncertain.', 'Một payment request đến provider và hoàn tất thành công, nhưng đường response thành công quay về bị đứt trước khi tới API caller, khiến caller không biết chắc kết quả.'),
    asset: '/illustrations/checkout/payment-ambiguity-window.svg',
  },
  'retry-storm-vs-jitter': {
    kind: 'static-image',
    title: t('Jitter spreads retries so recovery capacity can breathe', 'Jitter phân tán retry để năng lực phục hồi có khoảng thở'),
    caption: t('Synchronized retries create repeated load spikes; jitter distributes attempts over time.', 'Retry đồng bộ tạo ra các đỉnh tải lặp lại; jitter phân tán các lần thử theo thời gian.'),
    description: t('One side shows repeated synchronized waves striking an overloaded dependency, while the other side spreads retry attempts irregularly toward a recovering dependency.', 'Một phía cho thấy các đợt retry đồng bộ lặp lại đánh vào dependency đang quá tải, còn phía kia phân tán các lần retry không đều theo thời gian hướng tới dependency đang phục hồi.'),
    asset: '/illustrations/checkout/retry-storm-vs-jitter.svg',
  },
} satisfies Partial<Record<AtlasIllustrationId, StaticTeachingIllustrationMedia>>;
