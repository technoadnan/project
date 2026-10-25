/* Lesson manifest: drives the roadmap, the pager and progress tracking. */
window.BD_PHASES = [
  { id: "foundations", title: "Foundations", blurb: "What a backend is, why it exists, and how to learn it so the knowledge transfers to any language." },
  { id: "request", title: "The life of a request", blurb: "Follow a single request from the wire to your business logic: protocol, routing, data formats, identity, validation and code layers." },
  { id: "data", title: "APIs & data", blurb: "Design the contract, store the data, make it fast, push slow work to the background, and search it." },
  { id: "reliability", title: "Reliability & operations", blurb: "Systems that fail well, configure safely, explain themselves, and stop without dropping work." },
  { id: "scale", title: "Security, scale & performance", blurb: "Defend the system, make it fast, keep it fast under load, and use the CPU well." },
  { id: "storage", title: "Files & real-time", blurb: "Store blobs the right way and push data to clients the moment it changes." },
  { id: "delivery", title: "Contracts, quality & delivery", blurb: "Prove it works, build it to run anywhere, document the contract, integrate with others, and ship it." }
];

window.BD_LESSONS = [
  { id: "01", no: "1", file: "01-roadmap.html", phase: "foundations", dur: "31:24", title: "Roadmap for backend from first principles", blurb: "The map of everything a backend engineer deals with, from the browser to production." },
  { id: "02", no: "2", file: "02-true-backend-engineer.html", phase: "foundations", dur: "3:53", title: "Walk the path of a true backend engineer", blurb: "How this series is meant to be learned: principles first, then implementation, then projects." },
  { id: "03", no: "3", file: "03-what-is-backend.html", phase: "foundations", dur: "19:01", title: "What is a backend, how does it work and why do we need it?", blurb: "Follow a request from DNS to an EC2 box, and see why the browser can't do it all." },
  { id: "04", no: "4", file: "04-first-principles.html", phase: "foundations", dur: "10:11", title: "Benefits of learning backend from first principles", blurb: "Why patterns beat frameworks, and how first principles make you language-agnostic." },
  { id: "05", no: "5", file: "05-http.html", phase: "request", dur: "1:18:13", title: "Understanding HTTP for backend engineers", blurb: "Statelessness, messages, methods, headers, CORS, status codes, caching and more." },
  { id: "06", no: "6", file: "06-routing.html", phase: "request", dur: "24:04", title: "What is routing in backend?", blurb: "How method + path find the right handler: static, dynamic, query, nested and grouped routes." },
  { id: "07", no: "7", file: "07-serialization.html", phase: "request", dur: "21:48", title: "Serialization and deserialization", blurb: "How a JavaScript object becomes JSON bytes on the wire and a Rust struct on the other side." },
  { id: "08", no: "8", file: "08-auth.html", phase: "request", dur: "1:35:57", title: "Authentication and authorization", blurb: "Sessions, JWTs, cookies, API keys, OAuth/OIDC, RBAC and the security details that matter." },
  { id: "09", no: "9", file: "09-validation.html", phase: "request", dur: "42:48", title: "Validations and transformations", blurb: "Syntactic, semantic and type checks at the edge, plus shaping input before it hits logic." },
  { id: "10", no: "10", file: "10-layers.html", phase: "request", dur: "59:57", title: "Controllers, services, repositories, middleware & request context", blurb: "The layers every request passes through, and what each one is responsible for." },
  { id: "11", no: "11", file: "11-rest-api.html", phase: "data", dur: "2:03:34", title: "Complete REST API design", blurb: "Resources, URLs, methods, idempotency, status codes, pagination, filtering and consistency." },
  { id: "12", no: "12", file: "12-postgres.html", phase: "data", dur: "2:45:25", title: "Mastering databases with Postgres", blurb: "Why databases, data types, migrations, schema design, relationships, safe queries, indexes and triggers." },
  { id: "13", no: "13", file: "13-caching.html", phase: "data", dur: "1:04:23", title: "Caching, the secret behind it all", blurb: "Cache levels, strategies, eviction and invalidation, and where Redis fits." },
  { id: "14", no: "14", file: "14-task-queues.html", phase: "data", dur: "55:47", title: "Task queues and background jobs", blurb: "Producers, brokers and consumers: retries, scheduling, workflows and best practices." },
  { id: "15", no: "15", file: "15-search.html", phase: "data", dur: "32:08", title: "Full text search with Elasticsearch", blurb: "Why LIKE queries fall over, and how inverted indexes and relevance scoring fix it." },
  { id: "16", no: "16", file: "16-error-handling.html", phase: "reliability", dur: "1:09:25", title: "Error handling and fault-tolerant systems", blurb: "Kinds of errors, catching them early, recovery and graceful degradation, a global error handler, and safe error messages." },
  { id: "17", no: "17", file: "17-config.html", phase: "reliability", dur: "36:14", title: "Production-grade configuration management", blurb: "What config is, where it lives, how it's loaded and validated, and how secrets stay safe." },
  { id: "18", no: "18", file: "18-observability.html", phase: "reliability", dur: "39:51", title: "Logging, monitoring and observability", blurb: "Logs, metrics and traces: what each answers and how they connect in production." },
  { id: "19", no: "19", file: "19-graceful-shutdown.html", phase: "reliability", dur: "35:56", title: "Graceful shutdown", blurb: "Signals, connection draining and resource cleanup, so deploys never drop a request." },
  { id: "20", no: "20", file: "20-security.html", phase: "scale", dur: "2:50:03", title: "Backend security: everything you need to know", blurb: "Injection, broken auth, XSS, CSRF, misconfiguration and how to defend each." },
  { id: "21", no: "21.1", file: "21-scaling-1.html", phase: "scale", dur: "1:47:31", title: "Backend scaling & performance engineering, part 1", blurb: "Latency vs throughput, percentiles, finding bottlenecks, and making the database fast." },
  { id: "22", no: "21.2", file: "22-scaling-2.html", phase: "scale", dur: "2:18:11", title: "Backend scaling & performance engineering, part 2", blurb: "Caching layers, horizontal scaling, load balancing, replicas, sharding and CDNs." },
  { id: "23", no: "22", file: "23-concurrency.html", phase: "scale", dur: "1:28:06", title: "Concurrency & parallelism: IO-bound vs CPU-bound", blurb: "Threads, event loops, goroutines and when more cores actually help." },
  { id: "24", no: "23", file: "24-object-storage-1.html", phase: "storage", dur: "1:29:29", title: "Object storage, part 1", blurb: "Why files don't belong in your database or disk, and how S3-style storage works." },
  { id: "25", no: "24", file: "25-object-storage-2.html", phase: "storage", dur: "49:37", title: "Object storage, part 2", blurb: "Presigned URLs, multipart uploads, processing pipelines and serving files via CDN." },
  { id: "26", no: "25", file: "26-real-time.html", phase: "storage", dur: "51:54", title: "Real-time backends", blurb: "Polling, long polling, SSE and WebSockets, and scaling them with pub/sub." },
  { id: "27", no: "26", file: "27-testing.html", phase: "delivery", dur: "1:24:32", title: "Testing for backend engineers", blurb: "Unit, integration and end-to-end tests, mocks, TDD and what coverage really tells you." },
  { id: "28", no: "27", file: "28-twelve-factor.html", phase: "delivery", dur: "1:33:18", title: "The Twelve-Factor App", blurb: "Twelve rules for apps that deploy anywhere, scale out and stay easy to operate." },
  { id: "29", no: "28", file: "29-openapi.html", phase: "delivery", dur: "43:55", title: "OpenAPI: the contract between clients and servers", blurb: "Describe your API once, then generate docs, clients, mocks and validation from it." },
  { id: "30", no: "29", file: "30-webhooks.html", phase: "delivery", dur: "56:07", title: "Webhooks: how the server calls you", blurb: "Event delivery to other servers: signatures, retries, idempotency and replay protection." },
  { id: "31", no: "30", file: "31-devops.html", phase: "delivery", dur: "1:48:26", title: "DevOps for backend engineers", blurb: "Containers, CI/CD, infrastructure as code, deployment strategies and running in production." }
];
