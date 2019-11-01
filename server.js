var toobusy = require('toobusy-js'),
    express = require('express'),
    request = require('request'),
    transform = require('./lib/image-transformer'),
    config  = require('./config'),
    app     = express(),
    mw_router = express.Router(),
    router = express.Router(),
    server;

// middleware which blocks requests when we're too busy
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "The server is busy right now, please try your request again.");
  } else {
    next();
  }
});

router.get(/\/(.+)/, function(req, res) {
    console.log (req.path);
    var url = config.get('images') + req.params[0];
    request(
        { uri: url }
        , function (error, response, body) {
            if(response.statusCode !== 200) {
                res.status(response.statusCode).send('not-found');
            }
        }
    )
    .on('response', function(image_stream) {
        transform(image_stream, req.query)
        .pipe(res.set('Cache-Control', 'public, s-maxage=31556952'));
    });
});

mw_router.get(/\/(.+)/, function(req, res) {
    var path = encodeURI(req.params[0]);
    var mwurl = config.get('mw_images') + path;
    request(
        { uri: mwurl }
        , function (error, response, body) {
            if(response.statusCode !== 200) {
                res.status(response.statusCode).send('file-not-found');
            }
        }
    )
    .on('response', function(image_stream) {
        transform(image_stream, req.query)
        .pipe(res.set('Cache-Control', 'public, s-maxage=31556952'));
    });
});

app.use('/mw', mw_router);
app.use('/d', router);

app.listen(config.get('port'), function(){
    console.log('server started on port ' + config.get('port'));
});
