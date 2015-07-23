var gm = require('gm').subClass({ imageMagick: true }),
    _ = require('lodash');

var transformMap = {
    // route example: /d/<img id>?w=100&h=100
    w: function(item, options) {
        return item.resize(options.w, options.h);
    },
    // route example: /d/<img id>?s=50
    s: function(item, options) {
        return item.resize(options.s, null, '%');
    },
    // route example: /d/<img id>?c=true&q=50
    q: function(item, options){
        return item
                .compress('JPEG')
                .quality(options.q);
    },
    // route example: /d/<img id>?t=photoby
    t: function(item, options){
        return item
                .size(function(err, size))
                .fill("#000")
                .drawRectangle(0, 0, size.width, 20)
                .fontSize(12)
                .fill("#fff")
                .drawText(20, 18, options.t,);
    },
    default: function(item){ return item;}
};

exports = module.exports = function(stream, options) {
    var item = gm(stream);

    _.each(_.keys(options), function(key){
        var transform = transformMap[key] || transformMap['default'];
        item = transform(item, options);
    });

    return item.stream();
};
