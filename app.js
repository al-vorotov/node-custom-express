const http = require('http');
const {login, logout, changed, deleted} = require('./controllers/index')

class ExpressCustom {
    constructor() {
        this._stack = [];
        this.postReq = [];
        this.getReq = [];
    }

    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function!');
        }
        this._stack.push(middleware);
    }

    listen(port, callback) {
        const handler = (req, res) => {
            this.handle(req, res, err => {
                if (err) {
                    switch (err.code) {
                        case 404:
                            res.writeHead(404);
                            res.end('Not found');
                        default:
                            res.writeHead(500);
                            res.end('Internal Server Error');
                    }

                } else {
                    switch (req.method) {
                        case "GET":
                            try {
                                const index = this.getReq.filter(item => item[req.url] && item)
                                index[0][req.url](req, res)
                            } catch (e) {
                                console.log(e)
                            }
                        case "POST":
                            try {
                                const index = this.postReq.filter(item => item[req.url] && item)
                                index[0][req.url](req, res)
                            } catch (e) {
                                console.log(e)
                            }
                    }
                }
            });
        };
        return http.createServer(handler).listen({port}, callback)
    }

    handle(req, res, callback) {
        let idx = 0;

        const next = (err) => {
            if (err != null) {
                return setImmediate(() => callback(err));
            }
            if (idx >= this._stack.length) {
                return setImmediate(() => callback());
            }

            const layer = this._stack[idx++];
            setImmediate(() => {
                try {
                    layer(req, res, next);
                } catch (error) {
                    next(error);
                }
            });
        };
        next();
    }

    get(path, callback) {
        if (typeof callback === 'function') {
            this.getReq.push({
                [path]: callback
            })
        } else {
            throw new Error('Middleware must be a function!');
        }
    }

    post(path, callback) {
        if (typeof callback === 'function') {
            this.postReq.push({
                [path]: callback
            })
        } else {
            throw new Error('Middleware must be a function!');
        }
    }
}


const app = new ExpressCustom()

app.use(function myMiddleware(req, res, next) {
    next();
});

app.use((req, res, next) => {
    next()
})

app.get('/logout', logout)
app.get('/test', deleted)
app.post('/login', login)
app.post('/changed', changed)


app.listen(3000, () => {
    console.log('ok')
})
