/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


ActionWordsService = {

    init: function(totalActions) {
        //load words...
        this.words = [
            "test", "hello", "auto", "bye", "mother", "son", "yellow", "perfect", "game"
        ]
        this.totalActions = totalActions
        this.currentWordSet = []
    },

    reshuffle: function() {
        this.words = shuffle(this.words)
    },

    getRegionPostfix: function(word) {
        let ws = this.currentWordSet.find( ws => {
            return ws.word == word
        })
        if(ws) return ws.regionPostfix
        return false
    },

    getAction: function(word) {
        let match = this.getWords().find( am => {
            return am.word == word
        })
        if(match) return match.action
        return false
    },

    getWords: function() {
        let actions = [ { action: "right", coords: [1, 0], regionPostfix: "right"}, 
                        { action: "left", coords: [-1, 0], regionPostfix: "left"}, 
                        { action: "jump-ahead", coords: [1,-0.5], regionPostfix: "upper-right"}, 
                        { action: "jump-back", coords:[-1, -0.5], regionPostfix: "upper-left"},
                        { action: "up", coords: [0, -1], regionPostfix: "up"}
                    ]

       this.currentWordSet = this.words.slice(0, this.totalActions).map( w => {
            let obj = actions.shift()
            obj.word = w
            return obj
       })
       return this.currentWordSet
    }
}