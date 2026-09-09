import type { ReactNode } from 'react';

type Locale = 'en' | 'vi';
type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'muted';

type LocalizedText = {
  en: string;
  vi: string;
};

type Card = {
  label: LocalizedText;
  detail?: LocalizedText;
  tone?: Tone;
};

type FlowDefinition = {
  kind: 'flow';
  title: LocalizedText;
  caption: LocalizedText;
  cards: Card[];
};

type CompareDefinition = {
  kind: 'compare';
  title: LocalizedText;
  caption: LocalizedText;
  columns: Array<{
    title: LocalizedText;
    cards: Card[];
  }>;
};

type TimelineDefinition = {
  kind: 'timeline';
  title: LocalizedText;
  caption: LocalizedText;
  lanes: Array<{
    label: LocalizedText;
    segments: Array<{
      label: LocalizedText;
      start: number;
      width: number;
      tone?: Tone;
    }>;
  }>;
};

type MatrixDefinition = {
  kind: 'matrix';
  title: LocalizedText;
  caption: LocalizedText;
  columns: LocalizedText[];
  rows: Array<{
    label: LocalizedText;
    cells: LocalizedText[];
  }>;
};

type ChartDefinition = {
  kind: 'chart';
  title: LocalizedText;
  caption: LocalizedText;
  xLabels: LocalizedText[];
  series: Array<{
    label: LocalizedText;
    values: number[];
    tone?: Tone;
  }>;
};

type IllustrationDefinition =
  | FlowDefinition
  | CompareDefinition
  | TimelineDefinition
  | MatrixDefinition
  | ChartDefinition;

const t = (en: string, vi: string): LocalizedText => ({ en, vi });

export const atlasIllustrationIds = [
  'checkout-consistency-boundaries',
  'payment-ambiguity-window',
  'dual-write-vs-outbox',
  'retry-storm-vs-jitter',
  'cold-vs-warm-start',
  'packaging-vs-operating-boundary',
  'serverless-downstream-avalanche',
  'tco-crossover',
  'rendering-strategies-timeline',
  'hydration-gap',
  'isr-lifecycle',
  'hybrid-rendering-architecture',
  'architecture-boundary-comparison',
  'blast-radius-comparison',
  'local-transaction-vs-saga',
  'distributed-monolith',
  'network-waterfall-vs-overlap',
  'dag-critical-path',
  'bounded-concurrency',
  'event-loop-architecture',
  'microtask-checkpoint-drain',
  'browser-rendering-pipeline',
  'main-thread-starvation',
  'promise-state-machine',
  'promise-chain-outcomes',
  'promise-error-propagation',
  'promise-combinators',
  'http-request-paths',
  'http-cache-revalidation',
  'http-version-architecture',
  'request-boundary-ownership',
] as const;

export type AtlasIllustrationId = (typeof atlasIllustrationIds)[number];

const definitions: Record<AtlasIllustrationId, IllustrationDefinition> = {
  'checkout-consistency-boundaries': {
    kind: 'flow',
    title: t('Checkout consistency boundaries', 'Các ranh giới nhất quán của Checkout'),
    caption: t(
      'Each boundary needs an explicit retry, identity, and recovery contract.',
      'Mỗi ranh giới cần một hợp đồng rõ ràng về retry, định danh và khôi phục.',
    ),
    cards: [
      { label: t('Client', 'Client'), detail: t('Idempotency key', 'Idempotency key'), tone: 'accent' },
      { label: t('Checkout API', 'Checkout API'), detail: t('Validate intent', 'Xác thực ý định') },
      { label: t('Local database', 'Cơ sở dữ liệu cục bộ'), detail: t('Order + outbox in one transaction', 'Order + outbox trong một transaction'), tone: 'success' },
      { label: t('Payment provider', 'Nhà cung cấp thanh toán'), detail: t('Outcome may be ambiguous after timeout', 'Kết quả có thể bất định sau timeout'), tone: 'warning' },
      { label: t('Broker → fulfillment', 'Broker → fulfillment'), detail: t('At-least-once handoff + idempotent consumer', 'At-least-once + consumer idempotent'), tone: 'accent' },
    ],
  },
  'payment-ambiguity-window': {
    kind: 'compare',
    title: t('Payment ambiguity after a lost response', 'Sự bất định thanh toán khi mất response'),
    caption: t(
      'A timeout tells the caller that the response is unknown, not that the remote operation failed.',
      'Timeout chỉ cho biết caller không biết response, không chứng minh thao tác phía xa đã thất bại.',
    ),
    columns: [
      {
        title: t('What actually happened', 'Điều thực sự đã xảy ra'),
        cards: [
          { label: t('Charge succeeds', 'Charge thành công'), tone: 'success' },
          { label: t('Response packet is lost', 'Gói response bị mất'), tone: 'danger' },
          { label: t('Caller sees timeout', 'Caller thấy timeout'), tone: 'warning' },
        ],
      },
      {
        title: t('Safe recovery', 'Khôi phục an toàn'),
        cards: [
          { label: t('Reuse the same idempotency key', 'Dùng lại cùng idempotency key'), tone: 'accent' },
          { label: t('Query / reconcile remote state', 'Query / reconcile trạng thái từ xa') },
          { label: t('Never infer “not charged” from timeout', 'Không suy ra “chưa trừ tiền” chỉ từ timeout'), tone: 'warning' },
        ],
      },
    ],
  },
  'dual-write-vs-outbox': {
    kind: 'compare',
    title: t('Dual write vs transactional outbox', 'Dual write so với Transactional Outbox'),
    caption: t(
      'The outbox makes the business transition and publish intent one local atomic write.',
      'Outbox đưa thay đổi nghiệp vụ và ý định publish vào cùng một ghi dữ liệu atomic cục bộ.',
    ),
    columns: [
      {
        title: t('Dual-write failure', 'Lỗi dual-write'),
        cards: [
          { label: t('Commit order', 'Commit order'), tone: 'success' },
          { label: t('Process crashes', 'Process crash'), tone: 'danger' },
          { label: t('Event never published', 'Event không bao giờ được publish'), tone: 'danger' },
        ],
      },
      {
        title: t('Transactional outbox', 'Transactional outbox'),
        cards: [
          { label: t('Commit order + outbox row', 'Commit order + outbox row'), tone: 'success' },
          { label: t('Publisher resumes later', 'Publisher tiếp tục sau đó'), tone: 'accent' },
          { label: t('Consumer handles duplicates', 'Consumer xử lý duplicate'), tone: 'accent' },
        ],
      },
    ],
  },
  'retry-storm-vs-jitter': {
    kind: 'chart',
    title: t('Retry storm vs full jitter', 'Retry storm so với full jitter'),
    caption: t(
      'Deterministic retries synchronize clients into spikes; jitter spreads retries across the recovery window.',
      'Retry theo mốc cố định đồng bộ các client thành đỉnh tải; jitter phân tán retry trong cửa sổ phục hồi.',
    ),
    xLabels: [t('0s', '0s'), t('1s', '1s'), t('2s', '2s'), t('4s', '4s'), t('8s', '8s')],
    series: [
      { label: t('Synchronized retries', 'Retry đồng loạt'), values: [12, 86, 96, 88, 74], tone: 'danger' },
      { label: t('Full jitter', 'Full jitter'), values: [12, 26, 34, 30, 22], tone: 'success' },
    ],
  },
  'cold-vs-warm-start': {
    kind: 'timeline',
    title: t('Cold start vs warm start', 'Cold start so với warm start'),
    caption: t(
      'Cold starts add provisioning and initialization before request handling; warm starts reuse an existing environment.',
      'Cold start thêm bước cấp phát và khởi tạo trước khi xử lý request; warm start tái sử dụng môi trường sẵn có.',
    ),
    lanes: [
      {
        label: t('Cold start', 'Cold start'),
        segments: [
          { label: t('Provision', 'Cấp phát'), start: 0, width: 18, tone: 'warning' },
          { label: t('Load runtime', 'Nạp runtime'), start: 18, width: 22, tone: 'warning' },
          { label: t('Initialize app', 'Khởi tạo app'), start: 40, width: 35, tone: 'accent' },
          { label: t('Handle request', 'Xử lý request'), start: 75, width: 25, tone: 'success' },
        ],
      },
      {
        label: t('Warm start', 'Warm start'),
        segments: [
          { label: t('Reuse environment', 'Tái sử dụng môi trường'), start: 0, width: 20, tone: 'accent' },
          { label: t('Handle request', 'Xử lý request'), start: 20, width: 25, tone: 'success' },
        ],
      },
    ],
  },
  'packaging-vs-operating-boundary': {
    kind: 'matrix',
    title: t('Packaging model vs operating model', 'Mô hình đóng gói so với mô hình vận hành'),
    caption: t(
      '“Container” describes a packaging boundary; “serverless” describes an operating model. They can overlap.',
      '“Container” mô tả ranh giới đóng gói; “serverless” mô tả mô hình vận hành. Hai khái niệm có thể giao nhau.',
    ),
    columns: [t('Code / zip', 'Code / zip'), t('OCI image', 'OCI image')],
    rows: [
      { label: t('Self-managed VM', 'VM tự quản lý'), cells: [t('Process deployment', 'Triển khai process'), t('Container runtime', 'Container runtime')] },
      { label: t('Managed cluster', 'Cluster được quản lý'), cells: [t('Rare fit', 'Ít phổ biến'), t('Managed containers', 'Container được quản lý')] },
      { label: t('Serverless execution', 'Serverless execution'), cells: [t('Functions', 'Functions'), t('Managed container service', 'Dịch vụ container serverless')] },
    ],
  },
  'serverless-downstream-avalanche': {
    kind: 'flow',
    title: t('Serverless downstream avalanche', 'Avalanche xuống downstream từ serverless'),
    caption: t(
      'Elastic compute can scale faster than a fixed database or third-party dependency.',
      'Compute co giãn có thể scale nhanh hơn nhiều so với database hoặc dependency có giới hạn cố định.',
    ),
    cards: [
      { label: t('Traffic burst', 'Traffic burst'), detail: t('40× incoming events', 'Sự kiện vào tăng 40×'), tone: 'warning' },
      { label: t('1,500 workers', '1.500 workers'), detail: t('Platform scales successfully', 'Platform scale thành công'), tone: 'accent' },
      { label: t('150 DB connections', '150 kết nối DB'), detail: t('Hard downstream limit', 'Giới hạn downstream cố định'), tone: 'danger' },
      { label: t('Timeout cascade', 'Chuỗi timeout'), detail: t('Connection pool exhaustion', 'Cạn connection pool'), tone: 'danger' },
    ],
  },
  'tco-crossover': {
    kind: 'chart',
    title: t('Illustrative cost crossover', 'Điểm giao chi phí minh họa'),
    caption: t(
      'Actual cost curves depend on provider pricing and workload shape; compare your measured model instead of category slogans.',
      'Đường cong chi phí thực tế phụ thuộc giá nhà cung cấp và hình dạng workload; hãy so sánh mô hình đo được thay vì khẩu hiệu.',
    ),
    xLabels: [t('Idle', 'Nhàn rỗi'), t('Low', 'Thấp'), t('Medium', 'Vừa'), t('High', 'Cao'), t('Steady', 'Ổn định')],
    series: [
      { label: t('Usage-based managed compute', 'Compute tính theo mức dùng'), values: [4, 20, 42, 70, 92], tone: 'accent' },
      { label: t('Reserved container / VM capacity', 'Container / VM có capacity cố định'), values: [38, 40, 44, 50, 60], tone: 'success' },
    ],
  },
  'rendering-strategies-timeline': {
    kind: 'timeline',
    title: t('CSR vs SSR vs SSG delivery timeline', 'Timeline phân phối CSR vs SSR vs SSG'),
    caption: t(
      'The strategies move HTML generation and JavaScript work to different points in the request and build lifecycle.',
      'Các chiến lược đặt việc tạo HTML và chạy JavaScript ở những thời điểm khác nhau trong vòng đời build và request.',
    ),
    lanes: [
      { label: t('CSR', 'CSR'), segments: [
        { label: t('HTML shell', 'HTML shell'), start: 0, width: 15, tone: 'muted' },
        { label: t('Download + execute JS', 'Tải + chạy JS'), start: 15, width: 45, tone: 'warning' },
        { label: t('Render content', 'Render nội dung'), start: 60, width: 25, tone: 'accent' },
        { label: t('Interactive', 'Tương tác'), start: 85, width: 15, tone: 'success' },
      ] },
      { label: t('SSR', 'SSR'), segments: [
        { label: t('Useful HTML', 'HTML hữu ích'), start: 0, width: 28, tone: 'accent' },
        { label: t('Download JS', 'Tải JS'), start: 28, width: 30, tone: 'warning' },
        { label: t('Hydrate', 'Hydrate'), start: 58, width: 22, tone: 'accent' },
        { label: t('Interactive', 'Tương tác'), start: 80, width: 20, tone: 'success' },
      ] },
      { label: t('SSG', 'SSG'), segments: [
        { label: t('Prebuilt HTML from CDN', 'HTML dựng sẵn từ CDN'), start: 0, width: 34, tone: 'success' },
        { label: t('Optional JS', 'JS tùy chọn'), start: 34, width: 26, tone: 'warning' },
        { label: t('Hydrate interactive regions', 'Hydrate vùng tương tác'), start: 60, width: 20, tone: 'accent' },
      ] },
    ],
  },
  'hydration-gap': {
    kind: 'flow',
    title: t('The hydration gap', 'Khoảng trống hydration'),
    caption: t(
      'SSR can make a page look ready before event handlers and client state are attached.',
      'SSR có thể làm trang trông như đã sẵn sàng trước khi event handler và state phía client được gắn vào.',
    ),
    cards: [
      { label: t('Server HTML arrives', 'Server HTML đến'), detail: t('Content is visible', 'Nội dung đã hiển thị'), tone: 'success' },
      { label: t('Hydration gap', 'Khoảng trống hydration'), detail: t('Looks interactive, handlers not ready yet', 'Trông có thể tương tác nhưng handler chưa sẵn sàng'), tone: 'warning' },
      { label: t('Client runtime hydrates', 'Client runtime hydrate'), detail: t('State + handlers attach', 'Gắn state + handler'), tone: 'accent' },
      { label: t('Interactive UI', 'UI tương tác'), detail: t('User actions are handled', 'Thao tác người dùng được xử lý'), tone: 'success' },
    ],
  },
  'isr-lifecycle': {
    kind: 'flow',
    title: t('Static revalidation lifecycle', 'Vòng đời revalidation của nội dung tĩnh'),
    caption: t(
      'A stale response can be served while regeneration happens in the background, depending on the framework and cache contract.',
      'Tùy hợp đồng cache và framework, response cũ có thể được phục vụ trong khi bản mới được tái tạo nền.',
    ),
    cards: [
      { label: t('Fresh cached page', 'Trang cache còn fresh'), detail: t('Serve immediately', 'Trả về ngay'), tone: 'success' },
      { label: t('Entry becomes stale', 'Entry trở thành stale'), detail: t('Revalidation becomes eligible', 'Đủ điều kiện revalidate'), tone: 'warning' },
      { label: t('Regenerate in background', 'Tái tạo nền'), detail: t('Keep serving according to cache policy', 'Tiếp tục phục vụ theo cache policy'), tone: 'accent' },
      { label: t('Publish refreshed entry', 'Publish entry mới'), detail: t('Future requests see new content', 'Request sau nhận nội dung mới'), tone: 'success' },
    ],
  },
  'hybrid-rendering-architecture': {
    kind: 'compare',
    title: t('Hybrid rendering inside one product', 'Hybrid rendering trong cùng một sản phẩm'),
    caption: t(
      'Rendering labels describe where specific work happens; a product can combine them by route or region.',
      'Nhãn rendering mô tả nơi một phần công việc xảy ra; sản phẩm có thể kết hợp chúng theo route hoặc vùng giao diện.',
    ),
    columns: [
      { title: t('Shared shell', 'Khung dùng chung'), cards: [{ label: t('Header / footer', 'Header / footer'), detail: t('SSG + CDN', 'SSG + CDN'), tone: 'success' }] },
      { title: t('Product content', 'Nội dung sản phẩm'), cards: [{ label: t('Request-aware detail', 'Chi tiết theo request'), detail: t('SSR', 'SSR'), tone: 'accent' }] },
      { title: t('Personal regions', 'Vùng cá nhân hóa'), cards: [{ label: t('Cart / recommendations', 'Giỏ hàng / gợi ý'), detail: t('CSR after load', 'CSR sau khi tải'), tone: 'warning' }] },
    ],
  },
  'architecture-boundary-comparison': {
    kind: 'compare',
    title: t('Monolith, modular monolith, and microservices', 'Monolith, Modular Monolith và Microservices'),
    caption: t(
      'The key difference is where module, deployment, process, data, and network boundaries are drawn.',
      'Khác biệt chính nằm ở vị trí đặt ranh giới module, deployment, process, dữ liệu và mạng.',
    ),
    columns: [
      { title: t('Monolith', 'Monolith'), cards: [
        { label: t('One process', 'Một process') },
        { label: t('Shared internal modules', 'Module nội bộ dùng chung') },
        { label: t('Often one transactional boundary', 'Thường có một ranh giới transaction'), tone: 'success' },
      ] },
      { title: t('Modular monolith', 'Modular Monolith'), cards: [
        { label: t('One deployment', 'Một deployment') },
        { label: t('Explicit module boundaries', 'Ranh giới module rõ ràng'), tone: 'accent' },
        { label: t('Local calls + shared transaction options', 'Local call + tùy chọn transaction dùng chung') },
      ] },
      { title: t('Microservices', 'Microservices'), cards: [
        { label: t('Independent deployments', 'Deployment độc lập'), tone: 'accent' },
        { label: t('Network APIs / events', 'Network API / event'), tone: 'warning' },
        { label: t('Separate failure + consistency boundaries', 'Ranh giới lỗi + nhất quán riêng') },
      ] },
    ],
  },
  'blast-radius-comparison': {
    kind: 'compare',
    title: t('Failure blast radius is a design outcome', 'Blast radius là kết quả của thiết kế'),
    caption: t(
      'A smaller process boundary can isolate one failure, but network dependencies can introduce new cascading failures.',
      'Ranh giới process nhỏ hơn có thể cô lập một lỗi, nhưng dependency qua mạng cũng có thể tạo chuỗi lỗi mới.',
    ),
    columns: [
      { title: t('Shared-process failure', 'Lỗi trong process dùng chung'), cards: [
        { label: t('Reports leaks memory', 'Reports rò rỉ bộ nhớ'), tone: 'danger' },
        { label: t('Process reaches OOM', 'Process bị OOM'), tone: 'danger' },
        { label: t('Checkout + auth also unavailable', 'Checkout + auth cũng ngừng hoạt động'), tone: 'danger' },
      ] },
      { title: t('Isolated service + guardrail', 'Service cô lập + guardrail'), cards: [
        { label: t('Reports service fails', 'Reports service lỗi'), tone: 'danger' },
        { label: t('Circuit breaker opens', 'Circuit breaker mở'), tone: 'warning' },
        { label: t('Core checkout continues', 'Checkout cốt lõi tiếp tục'), tone: 'success' },
      ] },
    ],
  },
  'local-transaction-vs-saga': {
    kind: 'compare',
    title: t('Local ACID transaction vs distributed recovery', 'ACID cục bộ so với khôi phục phân tán'),
    caption: t(
      'Cross-service work cannot rely on one process call stack or one database rollback boundary.',
      'Công việc xuyên service không thể dựa vào một call stack hay một ranh giới rollback database duy nhất.',
    ),
    columns: [
      { title: t('Local transaction', 'Transaction cục bộ'), cards: [
        { label: t('Write A', 'Ghi A'), tone: 'accent' },
        { label: t('Write B', 'Ghi B'), tone: 'accent' },
        { label: t('Commit or rollback together', 'Commit hoặc rollback cùng nhau'), tone: 'success' },
      ] },
      { title: t('Distributed workflow', 'Workflow phân tán'), cards: [
        { label: t('Service A commits', 'Service A commit'), tone: 'success' },
        { label: t('Service B times out', 'Service B timeout'), tone: 'warning' },
        { label: t('Reconcile / compensate / retry', 'Reconcile / compensate / retry'), tone: 'accent' },
      ] },
    ],
  },
  'distributed-monolith': {
    kind: 'flow',
    title: t('The distributed monolith anti-pattern', 'Anti-pattern Distributed Monolith'),
    caption: t(
      'Separate deployables do not provide autonomy when changes, data, and synchronous calls remain tightly coupled.',
      'Deployable tách riêng không tạo ra tính tự chủ nếu thay đổi, dữ liệu và synchronous call vẫn gắn chặt.',
    ),
    cards: [
      { label: t('Service A', 'Service A'), detail: t('Must call B synchronously', 'Phải gọi B đồng bộ'), tone: 'warning' },
      { label: t('Service B', 'Service B'), detail: t('Must call C synchronously', 'Phải gọi C đồng bộ'), tone: 'warning' },
      { label: t('Service C', 'Service C'), detail: t('Shared database assumptions', 'Giả định DB dùng chung'), tone: 'danger' },
      { label: t('Lockstep release', 'Release lockstep'), detail: t('Operational cost without autonomy', 'Tăng chi phí vận hành nhưng không có tự chủ'), tone: 'danger' },
    ],
  },
  'network-waterfall-vs-overlap': {
    kind: 'compare',
    title: t('Sequential waterfall vs overlapped waits', 'Waterfall tuần tự so với thời gian chờ chồng lấp'),
    caption: t(
      'Independent waits can start together so elapsed time approaches the slowest required branch instead of the sum.',
      'Các khoảng chờ độc lập có thể bắt đầu cùng lúc để tổng thời gian gần với nhánh bắt buộc chậm nhất thay vì tổng tất cả.',
    ),
    columns: [
      { title: t('Sequential: ~1500 ms', 'Tuần tự: ~1500 ms'), cards: [
        { label: t('A · 800 ms', 'A · 800 ms'), tone: 'accent' },
        { label: t('B · 400 ms', 'B · 400 ms'), tone: 'warning' },
        { label: t('C · 300 ms', 'C · 300 ms'), tone: 'success' },
      ] },
      { title: t('Overlapped: ~800 ms', 'Chồng lấp: ~800 ms'), cards: [
        { label: t('A starts at 0 · 800 ms', 'A bắt đầu t=0 · 800 ms'), tone: 'accent' },
        { label: t('B starts at 0 · 400 ms', 'B bắt đầu t=0 · 400 ms'), tone: 'warning' },
        { label: t('C starts at 0 · 300 ms', 'C bắt đầu t=0 · 300 ms'), tone: 'success' },
      ] },
    ],
  },
  'dag-critical-path': {
    kind: 'flow',
    title: t('Dependency graph and critical path', 'Đồ thị phụ thuộc và Critical Path'),
    caption: t(
      'Start independent branches early while preserving the real dependency chain that determines completion.',
      'Khởi động sớm các nhánh độc lập nhưng vẫn giữ đúng chuỗi phụ thuộc thực sự quyết định thời điểm hoàn tất.',
    ),
    cards: [
      { label: t('getUser · 500 ms', 'getUser · 500 ms'), detail: t('Critical path starts', 'Bắt đầu critical path'), tone: 'accent' },
      { label: t('getOrganization · 400 ms', 'getOrganization · 400 ms'), detail: t('Depends on user', 'Phụ thuộc user'), tone: 'danger' },
      { label: t('Feature flags · 300 ms', 'Feature flags · 300 ms'), detail: t('Independent from t=0', 'Độc lập từ t=0'), tone: 'success' },
      { label: t('Recommendations · 700 ms', 'Recommendations · 700 ms'), detail: t('Independent from t=0', 'Độc lập từ t=0'), tone: 'success' },
    ],
  },
  'bounded-concurrency': {
    kind: 'flow',
    title: t('Bounded concurrency protects downstream capacity', 'Concurrency có giới hạn bảo vệ downstream'),
    caption: t(
      'A worker pool lets independent work overlap without opening unbounded connections or requests.',
      'Worker pool cho phép công việc độc lập chồng lấp mà không mở số kết nối hoặc request không giới hạn.',
    ),
    cards: [
      { label: t('1,000 queued jobs', '1.000 job trong queue'), detail: t('Independent work', 'Công việc độc lập'), tone: 'muted' },
      { label: t('Semaphore: 5 slots', 'Semaphore: 5 slot'), detail: t('Admission control', 'Kiểm soát đầu vào'), tone: 'accent' },
      { label: t('5 active workers', '5 worker đang chạy'), detail: t('Bounded fan-out', 'Fan-out có giới hạn'), tone: 'success' },
      { label: t('Database / API', 'Database / API'), detail: t('Stable downstream load', 'Tải downstream ổn định'), tone: 'success' },
    ],
  },
  'event-loop-architecture': {
    kind: 'compare',
    title: t('Browser event-loop work areas', 'Các vùng công việc của Browser Event Loop'),
    caption: t(
      'Current JavaScript runs to completion; microtasks drain at checkpoints; later tasks and rendering wait for their turn.',
      'JavaScript hiện tại chạy đến hết; microtask được xả tại checkpoint; task sau và rendering chờ đến lượt.',
    ),
    columns: [
      { title: t('Current task', 'Task hiện tại'), cards: [
        { label: t('Call stack', 'Call stack'), detail: t('Run-to-completion JavaScript', 'JavaScript chạy đến hết'), tone: 'accent' },
      ] },
      { title: t('Microtask queue', 'Microtask queue'), cards: [
        { label: t('Promise reactions', 'Promise reaction') },
        { label: t('queueMicrotask()', 'queueMicrotask()') },
      ] },
      { title: t('Later browser work', 'Công việc browser sau đó'), cards: [
        { label: t('Task queues', 'Task queue'), detail: t('Timers, input, networking', 'Timer, input, network'), tone: 'warning' },
        { label: t('Rendering opportunity', 'Rendering opportunity'), detail: t('May update a frame', 'Có thể cập nhật frame'), tone: 'success' },
      ] },
    ],
  },
  'microtask-checkpoint-drain': {
    kind: 'flow',
    title: t('Microtask checkpoint drains until empty', 'Microtask checkpoint xả cho đến khi rỗng'),
    caption: t(
      'A microtask can enqueue another microtask, and the new work can run in the same checkpoint before later tasks.',
      'Một microtask có thể enqueue microtask khác và công việc mới có thể chạy trong cùng checkpoint trước task sau.',
    ),
    cards: [
      { label: t('Current task finishes', 'Task hiện tại kết thúc'), tone: 'accent' },
      { label: t('Run next microtask', 'Chạy microtask tiếp theo'), tone: 'success' },
      { label: t('New microtask queued?', 'Có microtask mới?'), detail: t('If yes, keep draining', 'Nếu có, tiếp tục xả'), tone: 'warning' },
      { label: t('Queue empty', 'Queue rỗng'), detail: t('Browser may continue scheduling / rendering', 'Browser có thể tiếp tục scheduling / rendering'), tone: 'success' },
    ],
  },
  'browser-rendering-pipeline': {
    kind: 'flow',
    title: t('Browser frame lifecycle', 'Vòng đời một frame của trình duyệt'),
    caption: t(
      'Rendering is an opportunity the browser schedules; it is not guaranteed after every task or microtask.',
      'Rendering là cơ hội do browser lập lịch; không được đảm bảo xảy ra sau mọi task hay microtask.',
    ),
    cards: [
      { label: t('Task + microtask checkpoint', 'Task + microtask checkpoint'), tone: 'accent' },
      { label: t('Rendering opportunity', 'Rendering opportunity'), detail: t('Browser may skip it', 'Browser có thể bỏ qua'), tone: 'warning' },
      { label: t('requestAnimationFrame', 'requestAnimationFrame'), detail: t('Before style/layout for the frame', 'Trước style/layout của frame'), tone: 'accent' },
      { label: t('Style → layout → paint', 'Style → layout → paint'), tone: 'success' },
      { label: t('Composite / present', 'Composite / present'), tone: 'success' },
    ],
  },
  'main-thread-starvation': {
    kind: 'compare',
    title: t('Two ways to starve the main thread', 'Hai cách làm nghẽn main thread'),
    caption: t(
      'One long synchronous task blocks progress directly; an unbounded microtask chain prevents the checkpoint from ending.',
      'Một synchronous task dài chặn tiến trình trực tiếp; chuỗi microtask vô hạn khiến checkpoint không thể kết thúc.',
    ),
    columns: [
      { title: t('Long synchronous task', 'Synchronous task dài'), cards: [
        { label: t('CPU work · 400 ms', 'CPU work · 400 ms'), tone: 'danger' },
        { label: t('Input waits in task queue', 'Input chờ trong task queue'), tone: 'warning' },
        { label: t('No frame can be presented', 'Không frame nào được present'), tone: 'danger' },
      ] },
      { title: t('Unbounded microtask chain', 'Chuỗi microtask vô hạn'), cards: [
        { label: t('Each microtask is small', 'Mỗi microtask rất nhỏ'), tone: 'muted' },
        { label: t('Each queues another', 'Mỗi cái lại queue cái khác'), tone: 'warning' },
        { label: t('Checkpoint never empties', 'Checkpoint không bao giờ rỗng'), tone: 'danger' },
      ] },
    ],
  },
  'promise-state-machine': {
    kind: 'compare',
    title: t('Promise state and resolution are different concepts', 'Trạng thái Promise và resolution là hai khái niệm khác nhau'),
    caption: t(
      'A Promise may be resolved to another pending Promise while its visible state is still pending.',
      'Một Promise có thể đã resolve theo một Promise khác vẫn pending trong khi trạng thái quan sát được của nó vẫn là pending.',
    ),
    columns: [
      { title: t('Promise state', 'Trạng thái Promise'), cards: [
        { label: t('pending', 'pending'), tone: 'warning' },
        { label: t('fulfilled(value)', 'fulfilled(value)'), tone: 'success' },
        { label: t('rejected(reason)', 'rejected(reason)'), tone: 'danger' },
      ] },
      { title: t('Resolution', 'Resolution'), cards: [
        { label: t('resolve(value)', 'resolve(value)'), detail: t('May fulfill directly', 'Có thể fulfill trực tiếp'), tone: 'success' },
        { label: t('resolve(otherPromise)', 'resolve(otherPromise)'), detail: t('Adopt its eventual outcome', 'Theo kết quả cuối cùng của Promise kia'), tone: 'accent' },
        { label: t('Resolved can still be pending', 'Đã resolved vẫn có thể pending'), tone: 'warning' },
      ] },
    ],
  },
  'promise-chain-outcomes': {
    kind: 'flow',
    title: t('Every Promise handler creates a downstream Promise', 'Mỗi Promise handler tạo một Promise downstream'),
    caption: t(
      'The handler result determines the downstream Promise: return a value, throw, or return another Promise to adopt.',
      'Kết quả của handler quyết định Promise downstream: return value, throw, hoặc return Promise khác để adopt.',
    ),
    cards: [
      { label: t('p0', 'p0'), detail: t('Source Promise', 'Promise nguồn'), tone: 'muted' },
      { label: t('then(handler)', 'then(handler)'), detail: t('Creates p1', 'Tạo p1'), tone: 'accent' },
      { label: t('return value', 'return value'), detail: t('p1 fulfills', 'p1 fulfilled'), tone: 'success' },
      { label: t('throw error', 'throw error'), detail: t('p1 rejects', 'p1 rejected'), tone: 'danger' },
      { label: t('return Promise', 'return Promise'), detail: t('p1 adopts it', 'p1 adopt Promise đó'), tone: 'warning' },
    ],
  },
  'promise-error-propagation': {
    kind: 'flow',
    title: t('Promise error propagation and recovery', 'Lan truyền lỗi và khôi phục trong Promise'),
    caption: t(
      'Rejections skip missing fulfillment handlers until a rejection handler runs; returning from catch recovers the chain.',
      'Rejection bỏ qua các fulfillment handler không phù hợp cho đến khi rejection handler chạy; return từ catch sẽ phục hồi chain.',
    ),
    cards: [
      { label: t('throw Error', 'throw Error'), tone: 'danger' },
      { label: t('then(onFulfilled)', 'then(onFulfilled)'), detail: t('Skipped', 'Bị bỏ qua'), tone: 'muted' },
      { label: t('catch(onRejected)', 'catch(onRejected)'), detail: t('Handles rejection', 'Xử lý rejection'), tone: 'accent' },
      { label: t('return fallback', 'return fallback'), detail: t('Downstream fulfills', 'Downstream fulfilled'), tone: 'success' },
      { label: t('forget to rethrow?', 'Quên rethrow?'), detail: t('May accidentally swallow failure', 'Có thể vô tình nuốt lỗi'), tone: 'warning' },
    ],
  },
  'promise-combinators': {
    kind: 'matrix',
    title: t('Promise combinator contracts', 'Hợp đồng của Promise combinator'),
    caption: t(
      'Choose the combinator whose success and failure contract matches the operation you are coordinating.',
      'Hãy chọn combinator có hợp đồng thành công/thất bại phù hợp với công việc cần điều phối.',
    ),
    columns: [t('Success condition', 'Điều kiện thành công'), t('Failure behavior', 'Hành vi khi lỗi')],
    rows: [
      { label: t('Promise.all', 'Promise.all'), cells: [t('Every input fulfills', 'Mọi input fulfilled'), t('Rejects on first observed rejection', 'Reject khi gặp rejection đầu tiên')] },
      { label: t('Promise.allSettled', 'Promise.allSettled'), cells: [t('Waits for every input to settle', 'Chờ mọi input settle'), t('Returns status records instead of failing fast', 'Trả record trạng thái thay vì fail-fast')] },
      { label: t('Promise.race', 'Promise.race'), cells: [t('First input to settle decides', 'Input settle đầu tiên quyết định'), t('Can fulfill or reject first', 'Có thể fulfilled hoặc rejected đầu tiên')] },
      { label: t('Promise.any', 'Promise.any'), cells: [t('First fulfillment wins', 'Fulfillment đầu tiên thắng'), t('Rejects only if all reject', 'Chỉ reject khi tất cả đều reject')] },
    ],
  },
  'http-request-paths': {
    kind: 'compare',
    title: t('Four common HTTP request paths', 'Bốn hành trình HTTP request phổ biến'),
    caption: t(
      'Not every request repeats DNS, connection setup, TLS, and origin processing.',
      'Không phải request nào cũng lặp lại DNS, thiết lập kết nối, TLS và xử lý tại origin.',
    ),
    columns: [
      { title: t('Client cache hit', 'Trúng client cache'), cards: [{ label: t('Fresh stored response', 'Stored response còn fresh'), detail: t('No network exchange', 'Không có network exchange'), tone: 'success' }] },
      { title: t('Warm connection', 'Kết nối còn ấm'), cards: [{ label: t('Reuse existing connection', 'Tái sử dụng kết nối hiện có'), detail: t('Skip new connection setup', 'Bỏ qua thiết lập kết nối mới'), tone: 'accent' }] },
      { title: t('Cold network path', 'Đường mạng cold'), cards: [{ label: t('Address → connection → security → HTTP', 'Địa chỉ → kết nối → bảo mật → HTTP'), tone: 'warning' }] },
      { title: t('Intermediary cache hit', 'Trúng cache trung gian'), cards: [{ label: t('CDN / proxy responds', 'CDN / proxy trả response'), detail: t('Origin may not run', 'Origin có thể không chạy'), tone: 'success' }] },
    ],
  },
  'http-cache-revalidation': {
    kind: 'flow',
    title: t('HTTP cache reuse and revalidation', 'Tái sử dụng và revalidation HTTP cache'),
    caption: t(
      'Fresh entries can be reused directly; stale entries may be validated conditionally before the stored representation is reused.',
      'Entry còn fresh có thể dùng trực tiếp; entry stale có thể được validate có điều kiện trước khi tái sử dụng representation đã lưu.',
    ),
    cards: [
      { label: t('Look up stored response', 'Tìm stored response'), tone: 'muted' },
      { label: t('Fresh?', 'Còn fresh?'), detail: t('Yes → reuse locally', 'Có → dùng lại local'), tone: 'success' },
      { label: t('Stale?', 'Đã stale?'), detail: t('Send validator such as ETag', 'Gửi validator như ETag'), tone: 'warning' },
      { label: t('304 Not Modified', '304 Not Modified'), detail: t('Network happened; representation can come from cache', 'Có network; representation có thể lấy từ cache'), tone: 'accent' },
      { label: t('200 with new representation', '200 với representation mới'), detail: t('Replace stored entry', 'Thay entry đã lưu'), tone: 'success' },
    ],
  },
  'http-version-architecture': {
    kind: 'compare',
    title: t('HTTP/1.1, HTTP/2, and HTTP/3 transport shape', 'Hình dạng truyền tải của HTTP/1.1, HTTP/2 và HTTP/3'),
    caption: t(
      'HTTP semantics remain HTTP; the versions differ in framing, multiplexing, and transport behavior.',
      'HTTP semantics vẫn là HTTP; các phiên bản khác nhau ở framing, multiplexing và hành vi transport.',
    ),
    columns: [
      { title: t('HTTP/1.1', 'HTTP/1.1'), cards: [
        { label: t('Requests share or use multiple TCP connections', 'Request chia sẻ hoặc dùng nhiều kết nối TCP') },
        { label: t('Limited multiplexing model', 'Mô hình multiplex hạn chế'), tone: 'warning' },
      ] },
      { title: t('HTTP/2', 'HTTP/2'), cards: [
        { label: t('Many HTTP streams on one TCP connection', 'Nhiều HTTP stream trên một kết nối TCP'), tone: 'accent' },
        { label: t('TCP loss can stall connection progress', 'Mất packet TCP có thể chặn tiến trình cả kết nối'), tone: 'warning' },
      ] },
      { title: t('HTTP/3', 'HTTP/3'), cards: [
        { label: t('HTTP over QUIC', 'HTTP trên QUIC'), tone: 'accent' },
        { label: t('Independent QUIC streams reduce cross-stream loss blocking', 'QUIC stream độc lập giảm chặn do mất packet giữa các stream'), tone: 'success' },
      ] },
    ],
  },
  'request-boundary-ownership': {
    kind: 'flow',
    title: t('Request path and boundary ownership', 'Đường đi request và quyền sở hữu theo ranh giới'),
    caption: t(
      'Trace which boundary actually produced the response before debugging the origin application.',
      'Hãy truy vết ranh giới nào thực sự tạo response trước khi debug origin application.',
    ),
    cards: [
      { label: t('Browser / app', 'Browser / app'), detail: t('Client cache and fetch policy', 'Client cache và fetch policy'), tone: 'muted' },
      { label: t('CDN / edge', 'CDN / edge'), detail: t('Cache, WAF, rate limit', 'Cache, WAF, rate limit'), tone: 'accent' },
      { label: t('Gateway / reverse proxy', 'Gateway / reverse proxy'), detail: t('TLS, auth, routing, timeout', 'TLS, auth, routing, timeout'), tone: 'warning' },
      { label: t('Load balancer', 'Load balancer'), detail: t('Backend selection / health', 'Chọn backend / health') },
      { label: t('Origin service', 'Origin service'), detail: t('Application logic', 'Logic ứng dụng'), tone: 'success' },
    ],
  },
};

function localized(value: LocalizedText, locale: Locale) {
  return value[locale];
}

const toneClass: Record<Tone, string> = {
  accent: 'border-fd-primary/35 bg-fd-primary/10',
  success: 'border-emerald-500/35 bg-emerald-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  danger: 'border-red-500/40 bg-red-500/10',
  muted: 'border-fd-border bg-fd-muted/35',
};

function DiagramCard({ card, locale }: { card: Card; locale: Locale }) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 ${toneClass[card.tone ?? 'muted']}`}
    >
      <div className="text-sm font-semibold text-fd-foreground">
        {localized(card.label, locale)}
      </div>
      {card.detail ? (
        <div className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
          {localized(card.detail, locale)}
        </div>
      ) : null}
    </div>
  );
}

function FlowDiagram({ definition, locale }: { definition: FlowDefinition; locale: Locale }) {
  return (
    <div className="grid gap-2 md:grid-flow-col md:auto-cols-fr md:items-stretch">
      {definition.cards.map((card, index) => (
        <div key={`${localized(card.label, locale)}-${index}`} className="contents">
          <DiagramCard card={card} locale={locale} />
          {index < definition.cards.length - 1 ? (
            <div
              aria-hidden="true"
              className="flex items-center justify-center text-lg font-semibold text-fd-muted-foreground max-md:rotate-90"
            >
              →
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CompareDiagram({ definition, locale }: { definition: CompareDefinition; locale: Locale }) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${Math.min(definition.columns.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {definition.columns.map((column) => (
        <section
          key={localized(column.title, locale)}
          className="min-w-0 rounded-xl border border-fd-border bg-fd-card/55 p-3"
        >
          <h4 className="m-0 text-sm font-semibold text-fd-foreground">
            {localized(column.title, locale)}
          </h4>
          <div className="mt-3 grid gap-2">
            {column.cards.map((card, index) => (
              <DiagramCard
                key={`${localized(card.label, locale)}-${index}`}
                card={card}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TimelineDiagram({ definition, locale }: { definition: TimelineDefinition; locale: Locale }) {
  return (
    <div className="grid gap-4">
      {definition.lanes.map((lane) => (
        <div key={localized(lane.label, locale)} className="grid gap-2 md:grid-cols-[8rem_1fr] md:items-center">
          <div className="text-sm font-semibold text-fd-foreground">
            {localized(lane.label, locale)}
          </div>
          <div className="relative h-14 overflow-hidden rounded-lg border border-fd-border bg-fd-muted/25">
            {lane.segments.map((segment, index) => (
              <div
                key={`${localized(segment.label, locale)}-${index}`}
                className={`absolute top-2 flex h-10 items-center overflow-hidden rounded-md border px-2 text-[11px] font-medium leading-tight text-fd-foreground ${toneClass[segment.tone ?? 'muted']}`}
                style={{ left: `${segment.start}%`, width: `${segment.width}%` }}
                title={localized(segment.label, locale)}
              >
                {localized(segment.label, locale)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatrixDiagram({ definition, locale }: { definition: MatrixDefinition; locale: Locale }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-fd-border">
      <table className="m-0 min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-fd-muted/40">
            <th className="border-b border-r border-fd-border px-3 py-2 text-left">{locale === 'vi' ? 'Phương án' : 'Option'}</th>
            {definition.columns.map((column) => (
              <th key={localized(column, locale)} className="border-b border-fd-border px-3 py-2 text-left">
                {localized(column, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {definition.rows.map((row) => (
            <tr key={localized(row.label, locale)} className="border-b border-fd-border last:border-b-0">
              <th className="border-r border-fd-border bg-fd-muted/20 px-3 py-2 text-left font-semibold">
                {localized(row.label, locale)}
              </th>
              {row.cells.map((cell, index) => (
                <td key={`${localized(row.label, locale)}-${index}`} className="px-3 py-2 text-fd-muted-foreground">
                  {localized(cell, locale)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartDiagram({ definition, locale }: { definition: ChartDefinition; locale: Locale }) {
  const width = 720;
  const height = 240;
  const left = 28;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const usableWidth = width - left - right;
  const usableHeight = height - top - bottom;
  const maxPoints = Math.max(...definition.series.map((series) => series.values.length));
  const pointString = (values: number[]) =>
    values
      .map((value, index) => {
        const x = left + (index / Math.max(maxPoints - 1, 1)) * usableWidth;
        const y = top + (1 - value / 100) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');
  const strokeByTone: Record<Tone, string> = {
    accent: 'var(--color-fd-primary)',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    muted: 'var(--color-fd-muted-foreground)',
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-card/45 p-2">
        <svg
          aria-hidden="true"
          className="min-w-[36rem] text-fd-muted-foreground"
          viewBox={`0 0 ${width} ${height}`}
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const y = top + (1 - value / 100) * usableHeight;
            return (
              <line
                key={value}
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.16"
              />
            );
          })}
          {definition.series.map((series) => (
            <polyline
              key={localized(series.label, locale)}
              points={pointString(series.values)}
              fill="none"
              stroke={strokeByTone[series.tone ?? 'accent']}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          ))}
          {definition.xLabels.map((label, index) => {
            const x = left + (index / Math.max(definition.xLabels.length - 1, 1)) * usableWidth;
            return (
              <text
                key={`${localized(label, locale)}-${index}`}
                x={x}
                y={height - 10}
                fill="currentColor"
                fontSize="11"
                textAnchor="middle"
              >
                {localized(label, locale)}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-fd-muted-foreground">
        {definition.series.map((series) => (
          <span key={localized(series.label, locale)} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: strokeByTone[series.tone ?? 'accent'] }}
            />
            {localized(series.label, locale)}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderDiagram(definition: IllustrationDefinition, locale: Locale): ReactNode {
  switch (definition.kind) {
    case 'flow':
      return <FlowDiagram definition={definition} locale={locale} />;
    case 'compare':
      return <CompareDiagram definition={definition} locale={locale} />;
    case 'timeline':
      return <TimelineDiagram definition={definition} locale={locale} />;
    case 'matrix':
      return <MatrixDiagram definition={definition} locale={locale} />;
    case 'chart':
      return <ChartDiagram definition={definition} locale={locale} />;
  }
}

export function AtlasIllustration({
  id,
  locale = 'en',
}: {
  id: AtlasIllustrationId;
  locale?: string;
}) {
  const resolvedLocale: Locale = locale === 'vi' ? 'vi' : 'en';
  const definition = definitions[id];
  const title = localized(definition.title, resolvedLocale);
  const caption = localized(definition.caption, resolvedLocale);
  const labelId = `atlas-illustration-${id}`;

  return (
    <figure
      data-atlas-illustration={id}
      aria-labelledby={labelId}
      className="my-7 overflow-hidden rounded-2xl border border-fd-border bg-gradient-to-br from-fd-card to-fd-muted/25 shadow-sm"
    >
      <div className="border-b border-fd-border px-4 py-3 sm:px-5">
        <div id={labelId} className="text-sm font-semibold text-fd-foreground">
          {title}
        </div>
      </div>
      <div className="p-4 sm:p-5">{renderDiagram(definition, resolvedLocale)}</div>
      <figcaption className="border-t border-fd-border bg-fd-muted/20 px-4 py-3 text-xs leading-relaxed text-fd-muted-foreground sm:px-5">
        {caption}
      </figcaption>
    </figure>
  );
}
