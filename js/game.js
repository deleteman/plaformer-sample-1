/**
 * main
 */
var game = {

    /**
     * object where to store game global data
     */
    data : {
        // score
        score : 0
    },

    /**
     *
     * Initialize the application
     */
    onload: function() {

        // init the video
        if (!me.video.init(965, 512, {wrapper : "screen", scale : "auto", scaleMethod : "fit", renderer : me.video.AUTO, subPixel : false })) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // initialize the "sound engine"
        me.audio.init("mp3,ogg");

        // set all ressources to be loaded
        me.loader.preload(game.resources, this.loaded.bind(this));
        ActionWordsService.init(5)
    },


    /**
     * callback when everything is loaded
     */
    loaded: function ()    {

        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // set the fade transition effect
        me.state.transition("fade", "#FFFFFF", 250);

        // register our objects entity in the object pool
        me.pool.register("mainPlayer", game.PlayerEntity);
        me.pool.register("SlimeEntity", game.SlimeEnemyEntity);
        me.pool.register("FlyEntity", game.FlyEnemyEntity);
        me.pool.register("CoinEntity", game.CoinEntity);
        me.pool.register("HUD.ActionControl", game.HUD.ActionControl);

        // load the texture atlas file
        // this will be used by object entities later
        game.texture = new me.video.renderer.Texture(
            me.loader.getJSON("texture"),
            me.loader.getImage("texture")
        );

        me.$input = $("#current-word")

        let lastWord = ''
        me.$input.keydown( (evnt) => {

            if(evnt.which == 13) {
                console.log("Last word: ", lastWord)
                StateManager.set("lastWord", lastWord)
                lastWord = ''
                me.$input.val("")
            } else {
                if(evnt.which > 20) {
                    let validChars = /[a-z0-9]+/gi
                    if(!String.fromCharCode(evnt.which).match(validChars)) return false
                }

                setTimeout(_ => {
                    lastWord = me.$input.val() //String.fromCharCode(evnt.which)
                    console.log("Partial: ", lastWord)
                }, 1)
            }
            setTimeout(() => {
                StateManager.set("partialWord", me.$input.val())
            }, 1);
        })




        // add some keyboard shortcuts
        me.event.subscribe(me.event.KEYDOWN, function (action, keyCode /*, edge */) {

            // change global volume setting
            if (keyCode === me.input.KEY.PLUS) {
                // increase volume
                me.audio.setVolume(me.audio.getVolume()+0.1);
            } else if (keyCode === me.input.KEY.MINUS) {
                // decrease volume
                me.audio.setVolume(me.audio.getVolume()-0.1);
            }

        });

        // switch to PLAY state
        me.state.change(me.state.PLAY);
    }
};
