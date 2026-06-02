const express = require('express');
const urlRoutes = require('./routes/urlRoutes');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const cors = require('cors');
const authRoutes = require('./auth/authRoutes');
const analyticsRoutes = require('./analytics/analyticsRoutes');
const {
    httpRequestDuration,
} = require('./monitoring/metrics');


const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(errorHandler);
app.use(express.json());
app.use((req,res,next)=>{
    const start = Date.now();
    res.on('finish',() =>{
        const duration = Date.now()-start;

        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.path,
                status_code: req.statusCode,
            },
            duration
        );
    });
    next();
});

app.use('/', urlRoutes);

app.get(
    '/metrics',
    async (req,res)=> {
        res.set(
            'Content-Type',
            client.register.contentType
        );

        res.end(
            await client.register.metrics()
        );
    }
);

app.use('/auth',authRoutes);
//app.use('/analyticsRoutes', analyticsRoutes)
app.use('/analytics', analyticsRoutes)


module.exports= app;

