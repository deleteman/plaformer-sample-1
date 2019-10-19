

const StateManager = {

    on: function(k, cb) {
        console.log("Adding observer for: ", k)
        if(!this.observers) {
            this.observers = {}
        }

        if(!this.observers[k]) {
            this.observers[k] = []
        }
        this.observers[k].push(cb)
    },
    clearObserver: function(k) {
        console.log("Removing observers for: ", k)
        this.observers[k] = []
    },
    trigger: function(k) {
        this.observers[k].forEach( cb => {
            cb(this.get(k))
        })
    },
    set: function(k, v) {
        this[k] = v
        this.trigger(k)
    },
    get: function(k) {
        return this[k]
    }

}