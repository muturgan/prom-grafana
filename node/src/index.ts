import fastify from 'fastify';
import Prometheus from 'prom-client';

// const collectDefaultMetrics = Prometheus.collectDefaultMetrics;

// Probe every 5th second.
// collectDefaultMetrics({ timeout: 5000 });


const queueGauge = new Prometheus.Gauge({
    name: 'test_gauge',
    labelNames: ['provider'],
    help: 'Test Gauge',
    // buckets: [0.1, 5, 15, 50, 100, 500, 1000, 5000]
});

const start = Date.now();
const simulateTime = 1000;

const directionsCounter = new Prometheus.Counter({
    name: 'test_directions_counter',
    help: 'Test Directions Counter',
    labelNames: ['direction'],
});


const counter = new Prometheus.Counter({
  name: 'test_counter',
  help: 'Test Counter',
});

const histogram = new Prometheus.Histogram({
  name: 'test_histogram',
  help: 'Test Histogram',
  buckets: [1, 2, 5, 6, 10],
});

const httpRequestRate = new Prometheus.Histogram({
    name: 'test_histogram_2',
    help: 'Test Histogram 2',
    labelNames: ['method', 'route', 'code'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 5000, 10000],
});



setInterval(() => {
    const end = Date.now() - start;

    counter.inc();
    directionsCounter.inc({
        direction: Math.random().toFixed(2),
    });

    histogram.observe(end / 1000); // convert to seconds
    httpRequestRate
        .labels('GET', 'key', '200')
        .observe(+Math.random().toFixed(2));

    queueGauge
        .labels('provider_code')
        .set(+Math.random().toFixed(2));

}, simulateTime);




const startServer = async () =>
{
    const app = fastify();
    const port =  3333;
    const host =  '0.0.0.0';

    app.get('/', (_req, res) => {
        console.info('Hello world!');
        res.send('Hello world!');
    });

    app.get('/metrics', (_req, res) => {
        res.header('Content-Type', Prometheus.register.contentType);
        res.send(Prometheus.register.metrics());
    });

    app.listen({port, host}, (error, address) => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
        console.info(`✓ fastify server listening at ${address}`);
    });
};

startServer();
