game.CoinEntity = me.CollectableEntity.extend({

    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the super constructor
        this._super(me.CollectableEntity, "init", [
            x, y ,
            Object.assign({
                image: game.texture,
                region : "coin.png"
            }, settings)
        ]);

    },

    /**
     * collision handling
     */
    onCollision : function (/*response*/) {

        // do something when collide
        me.audio.play("cling", false);
        // give some score
        game.data.score += Constants.SCORES.COIN

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return false;
    }
});
