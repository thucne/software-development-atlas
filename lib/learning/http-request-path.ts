export type RequestPathScenarioId =
  | 'cold-request'
  | 'warm-connection'
  | 'fresh-cache-hit'
  | 'stale-cache-revalidation'
  | 'intermediary-cache-hit'
  | 'redirect';

export type RequestStageId =
  | 'construct-request'
  | 'http-cache'
  | 'dns'
  | 'transport-connect'
  | 'tls'
  | 'send-http'
  | 'intermediary'
  | 'origin'
  | 'receive-response'
  | 'follow-redirect';

export type RequestStageState = 'performed' | 'skipped' | 'conditional';

export type RequestPathStage = {
  id: RequestStageId;
  state: RequestStageState;
  label: string;
  explanation: string;
};

export type RequestPathScenario = {
  id: RequestPathScenarioId;
  title: string;
  summary: string;
  stages: RequestPathStage[];
};

const coldRequest: RequestPathScenario = {
  id: 'cold-request',
  title: 'Cold HTTPS request',
  summary:
    'The client has no fresh HTTP-cache response and no suitable existing connection. This HTTPS scenario needs new connection and secure-session setup before the HTTP exchange.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct request',
      explanation:
        'The caller creates the request semantics: method, target URL, headers, body, and relevant browser policy context.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check HTTP cache',
      explanation:
        'The client checks whether a reusable stored response can satisfy this request. In this scenario the cache lookup misses.',
    },
    {
      id: 'dns',
      state: 'conditional',
      label: 'Resolve an address if needed',
      explanation:
        'Name resolution is needed only when the client does not already have a usable address result. A cold HTTP connection does not prove that every DNS layer is also cold.',
    },
    {
      id: 'transport-connect',
      state: 'performed',
      label: 'Establish transport connection',
      explanation:
        'Because no suitable connection exists, the client establishes the transport used by the selected HTTP version, such as TCP for typical HTTP/1.1 or HTTP/2 use, or QUIC for HTTP/3.',
    },
    {
      id: 'tls',
      state: 'performed',
      label: 'Establish secure session',
      explanation:
        'This scenario uses HTTPS, so secure-session setup is required for the new connection. TLS is surrounding transport/security work, not the semantics of the HTTP request itself.',
    },
    {
      id: 'send-http',
      state: 'performed',
      label: 'Send HTTP request',
      explanation:
        'The request semantics are carried using the selected HTTP version once a suitable connection is available.',
    },
    {
      id: 'intermediary',
      state: 'conditional',
      label: 'Traverse intermediaries if present',
      explanation:
        'A proxy, CDN, gateway, or load balancer can participate, but HTTP does not require every request to pass through the same intermediary topology.',
    },
    {
      id: 'origin',
      state: 'performed',
      label: 'Origin handles request',
      explanation:
        'In this scenario no earlier cache satisfies the request, so the origin-side application path produces the response.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Receive and process response',
      explanation:
        'The client receives the HTTP response status, fields, and body, then applies browser or application response handling such as streaming, caching, or decoding.',
    },
    {
      id: 'follow-redirect',
      state: 'skipped',
      label: 'Construct redirect follow-up',
      explanation: 'This response is not a redirect, so no follow-up request is created.',
    },
  ],
};

const warmConnection: RequestPathScenario = {
  id: 'warm-connection',
  title: 'Warm connection',
  summary:
    'The HTTP cache does not satisfy the request, but a suitable connection already exists. This exchange sends HTTP without repeating new DNS, transport-connection, or TLS setup.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct request',
      explanation: 'The caller constructs a new HTTP request even though transport setup can be reused.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check HTTP cache',
      explanation: 'The cache is checked but does not return a reusable response for this scenario.',
    },
    {
      id: 'dns',
      state: 'skipped',
      label: 'Resolve an address if needed',
      explanation:
        'No new name resolution is required for this exchange because the client is reusing an already established suitable connection.',
    },
    {
      id: 'transport-connect',
      state: 'skipped',
      label: 'Establish transport connection',
      explanation: 'The transport connection already exists and is reused for this request.',
    },
    {
      id: 'tls',
      state: 'skipped',
      label: 'Establish secure session',
      explanation: 'The secure session associated with the reused HTTPS connection is already established.',
    },
    {
      id: 'send-http',
      state: 'performed',
      label: 'Send HTTP request',
      explanation:
        'The request is carried over the existing connection. Connection reuse does not mean that the HTTP request itself is skipped.',
    },
    {
      id: 'intermediary',
      state: 'conditional',
      label: 'Traverse intermediaries if present',
      explanation: 'The reused connection may lead to an intermediary or directly toward the origin path, depending on the deployment.',
    },
    {
      id: 'origin',
      state: 'performed',
      label: 'Origin handles request',
      explanation: 'This scenario assumes no intermediary cache answers the request, so origin-side processing occurs.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Receive and process response',
      explanation: 'The response returns over the available connection and is processed by the client.',
    },
    {
      id: 'follow-redirect',
      state: 'skipped',
      label: 'Construct redirect follow-up',
      explanation: 'This response is not a redirect.',
    },
  ],
};

const freshCacheHit: RequestPathScenario = {
  id: 'fresh-cache-hit',
  title: 'Fresh cache hit',
  summary:
    'A fresh stored response satisfies the request from the client HTTP cache, so this request path ends before a network exchange reaches an intermediary or origin.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct request',
      explanation: 'The caller still creates the request used to select a matching stored response.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check HTTP cache',
      explanation: 'The HTTP cache finds a matching fresh response that can be reused without validation.',
    },
    {
      id: 'dns',
      state: 'skipped',
      label: 'Resolve an address if needed',
      explanation: 'No network request is needed for this path, so name resolution is not needed for this exchange.',
    },
    {
      id: 'transport-connect',
      state: 'skipped',
      label: 'Establish transport connection',
      explanation: 'No new transport connection is needed because the stored response satisfies this request.',
    },
    {
      id: 'tls',
      state: 'skipped',
      label: 'Establish secure session',
      explanation: 'No new secure-session setup is needed because there is no network exchange for this request path.',
    },
    {
      id: 'send-http',
      state: 'skipped',
      label: 'Send HTTP request',
      explanation: 'The request is satisfied locally by the HTTP cache instead of being sent over the network.',
    },
    {
      id: 'intermediary',
      state: 'skipped',
      label: 'Traverse intermediaries if present',
      explanation: 'No network request leaves the client, so no network intermediary handles this request.',
    },
    {
      id: 'origin',
      state: 'skipped',
      label: 'Origin handles request',
      explanation: 'The origin is not contacted for this fresh cache hit.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Return cached response',
      explanation: 'The stored response is returned to the caller as the result of the request.',
    },
    {
      id: 'follow-redirect',
      state: 'skipped',
      label: 'Construct redirect follow-up',
      explanation: 'This cached response is not a redirect in the scenario.',
    },
  ],
};

const staleCacheRevalidation: RequestPathScenario = {
  id: 'stale-cache-revalidation',
  title: 'Stale cache revalidation',
  summary:
    'This scenario shows one possible conditional revalidation path: a stale stored response causes a conditional network request, and the validator returns 304 Not Modified so the stored response can be reused after validation.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct request',
      explanation: 'The caller constructs the request used for cache selection and possible validation.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check HTTP cache',
      explanation:
        'A matching stored response exists but is stale for this scenario, so the cache cannot reuse it as fresh without validation.',
    },
    {
      id: 'dns',
      state: 'conditional',
      label: 'Resolve an address if needed',
      explanation: 'A network validation request is required, but name resolution is needed only if no usable address result or connection path already exists.',
    },
    {
      id: 'transport-connect',
      state: 'conditional',
      label: 'Establish transport connection if needed',
      explanation: 'The validation request can reuse a suitable connection or establish a new one if necessary.',
    },
    {
      id: 'tls',
      state: 'conditional',
      label: 'Establish secure session if needed',
      explanation: 'For HTTPS, new secure-session setup is needed only when the validation request cannot reuse a suitable established connection.',
    },
    {
      id: 'send-http',
      state: 'performed',
      label: 'Send conditional HTTP request',
      explanation: 'The client sends a conditional request carrying validators from the stored response when available.',
    },
    {
      id: 'intermediary',
      state: 'conditional',
      label: 'Traverse intermediaries if present',
      explanation: 'An intermediary can participate in validation, but its presence is deployment-specific.',
    },
    {
      id: 'origin',
      state: 'performed',
      label: 'Validator handles request',
      explanation: 'This scenario reaches the validating server and receives a 304 Not Modified response. Other revalidation outcomes are possible.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Reuse validated stored response',
      explanation: 'The 304 response refreshes the stored metadata as defined by HTTP caching rules, and the stored response is used for the caller.',
    },
    {
      id: 'follow-redirect',
      state: 'skipped',
      label: 'Construct redirect follow-up',
      explanation: 'The validation result is not a redirect in this scenario.',
    },
  ],
};

const intermediaryCacheHit: RequestPathScenario = {
  id: 'intermediary-cache-hit',
  title: 'Intermediary cache hit',
  summary:
    'The client cache misses, a network request is sent, and a shared intermediary cache returns a reusable response before the origin application handles the request.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct request',
      explanation: 'The client constructs the HTTP request normally.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check client HTTP cache',
      explanation: 'The private/client cache does not satisfy the request, so a network request proceeds.',
    },
    {
      id: 'dns',
      state: 'conditional',
      label: 'Resolve an address if needed',
      explanation: 'Name resolution depends on whether a suitable address result or existing connection path is already available.',
    },
    {
      id: 'transport-connect',
      state: 'conditional',
      label: 'Establish transport connection if needed',
      explanation: 'The client may reuse a connection to the intermediary path or establish a new one.',
    },
    {
      id: 'tls',
      state: 'conditional',
      label: 'Establish secure session if needed',
      explanation: 'For HTTPS, secure-session setup depends on whether a suitable secure connection is already established.',
    },
    {
      id: 'send-http',
      state: 'performed',
      label: 'Send HTTP request',
      explanation: 'Unlike a client-cache hit, this request leaves the client over the network.',
    },
    {
      id: 'intermediary',
      state: 'performed',
      label: 'Intermediary cache answers',
      explanation: 'A shared cache has an applicable reusable response and returns it without forwarding this request to the origin application.',
    },
    {
      id: 'origin',
      state: 'skipped',
      label: 'Origin handles request',
      explanation: 'The request/response chain is shortened by the intermediary cache, so this request does not reach origin application processing.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Receive and process response',
      explanation: 'The client receives the response returned by the intermediary cache.',
    },
    {
      id: 'follow-redirect',
      state: 'skipped',
      label: 'Construct redirect follow-up',
      explanation: 'This cached response is not a redirect in the scenario.',
    },
  ],
};

const redirectScenario: RequestPathScenario = {
  id: 'redirect',
  title: 'Redirect',
  summary:
    'The first HTTP exchange returns a redirect response. Following it creates another request whose cache, connection, intermediary, and origin path must be evaluated again for the new target.',
  stages: [
    {
      id: 'construct-request',
      state: 'performed',
      label: 'Construct initial request',
      explanation: 'The client constructs the first HTTP request for the original target.',
    },
    {
      id: 'http-cache',
      state: 'performed',
      label: 'Check HTTP cache',
      explanation: 'The initial request is checked against applicable cached responses; this scenario proceeds to the network.',
    },
    {
      id: 'dns',
      state: 'conditional',
      label: 'Resolve an address if needed',
      explanation: 'Name resolution is needed only if the current request path lacks a usable address or existing connection.',
    },
    {
      id: 'transport-connect',
      state: 'conditional',
      label: 'Establish transport connection if needed',
      explanation: 'The first exchange may reuse a connection or establish a new one.',
    },
    {
      id: 'tls',
      state: 'conditional',
      label: 'Establish secure session if needed',
      explanation: 'For HTTPS, new secure-session setup depends on whether a suitable secure connection already exists.',
    },
    {
      id: 'send-http',
      state: 'performed',
      label: 'Send initial HTTP request',
      explanation: 'The initial request is sent and receives an HTTP redirect response.',
    },
    {
      id: 'intermediary',
      state: 'conditional',
      label: 'Traverse intermediaries if present',
      explanation: 'The redirect can be generated by an intermediary or the origin path; this scenario does not require one specific topology.',
    },
    {
      id: 'origin',
      state: 'performed',
      label: 'Initial target returns redirect',
      explanation: 'For this scenario, the origin-side path returns the redirect response.',
    },
    {
      id: 'receive-response',
      state: 'performed',
      label: 'Process redirect response',
      explanation: 'The client processes the redirect status and target according to its redirect policy.',
    },
    {
      id: 'follow-redirect',
      state: 'performed',
      label: 'Construct follow-up request',
      explanation: 'Following the redirect creates a new request. Its cache and connection path is evaluated again for the new target rather than blindly inheriting every stage from the first request.',
    },
  ],
};

export const HTTP_REQUEST_PATH_SCENARIOS: readonly RequestPathScenario[] = [
  coldRequest,
  warmConnection,
  freshCacheHit,
  staleCacheRevalidation,
  intermediaryCacheHit,
  redirectScenario,
];

export function getRequestPathScenario(
  id: RequestPathScenarioId,
): RequestPathScenario {
  const scenario = HTTP_REQUEST_PATH_SCENARIOS.find(
    (candidate) => candidate.id === id,
  );

  if (!scenario) {
    throw new Error(`Unknown HTTP request path scenario: ${id}`);
  }

  return scenario;
}
