/**
 * 
 * WARNING:
 * If you opened this file, close it immediately.
 * I wrote this like full of shit.
 * 
 */

(function (root, factory) {
    root.CVPromise = factory();
})(window, function () {
    var CVPromise = function (fn) {
        this.__IS_PROMISE__ = true;
        this.$fn = fn;
        this.$resolvers = [];
        this.$rejectors = [];
        this.$state = 'pending';
        this.__execute();
    };

    CVPromise.prototype.then = function (onRes, onRej) {
        var that = this;
        return new CVPromise(function (res, rej) {
            that.$resolvers.push(function (result) {
                var ret = onRes(result);
                if (ret && ret.__IS_PROMISE__) {
                    ret.then(function (_result) {
                        res(_result);
                    }, function (_err) {
                        rej(_err);
                    });
                } else {
                    res(ret);
                }
            });

            that.$rejectors.push(function (error) {
                rej(error);
            });
        });
    }

    CVPromise.prototype.__resolved = function (res) {
        this.$state = 'resolved';
        this.$resolvers.forEach(function (cb) {
            cb(res);
        });
    };

    CVPromise.prototype.__rejected = function (err) {
        this.$state = 'rejected';
        this.$rejectors.forEach(function (cb) {
            cb(err);
        });
    };

    CVPromise.prototype.__execute = function () {
        this.$fn(this.__resolved.bind(this), this.__rejected.bind(this));
    };

    return CVPromise;
});