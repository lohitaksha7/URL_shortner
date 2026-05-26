const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration',
    labelNames:[
        'method',
        'route',
        'status_code',
    ],
    buckets:[
        50,
        100,
        200,
        500,
        1000,
    ],
});

module.exports = {
    client,
    httpRequestDuration,
}