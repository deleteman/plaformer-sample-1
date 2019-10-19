game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this._super(me.Entity, "init", [x, y , settings]);

        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;

        // walking & jumping speed
        this.body.setMaxVelocity(6, 15);
        this.body.setFriction(0.4, 0);

        this.dying = false;

        this.mutipleJump = 1;

        // set the viewport to follow this renderable on both axis, and enable damping
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH, 0.1);

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "walk0001.png", "walk0002.png", "walk0003.png",
            "walk0004.png", "walk0005.png", "walk0006.png",
            "walk0007.png", "walk0008.png", "walk0009.png",
            "walk0010.png", "walk0011.png"
        ]);

        // define a basic walking animatin
        this.renderable.addAnimation ("walk",  [{ name: "walk0001.png", delay: 100 }, { name: "walk0002.png", delay: 100 }, { name: "walk0003.png", delay: 100 }]);
        // set as default
        this.renderable.setCurrentAnimation("walk");

        StateManager.on('lastWord', (lw) => {
            this.direction = ActionWordsService.getAction(lw)

            this.move()
            setTimeout( _ => {
                this.direction = null
                ActionWordsService.reshuffle()
            }, 1)

        })

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 0.5);
    },

    moveRight: function(extra) {
        extra = extra || 0
        this.body.force.x = this.body.maxVel.x + extra;
        this.renderable.flipX(false);
    },
    moveLeft: function(extra) {
        extra = extra || 0
        this.body.force.x = -(this.body.maxVel.x + extra);
        this.renderable.flipX(true);
    },
    jump: function() {
        this.body.jumping = true;
        this.body.force.y = -this.body.maxVel.y 
        me.audio.play("jump", false);
    },
    move: function() {
        if(this.direction == "up") {
            this.jump()
        }

        if(this.direction == 'right') {
            this.moveRight()
        }

        if(this.direction == 'left') {
            this.moveLeft()
        }

        if(this.direction == 'jump-ahead') {
            this.jump()
            this.moveRight(0.5)
        }
        if(this.direction == "jump-back") {
            this.jump()
            this.moveLeft(0.5)
        }
    },
    update: function(dt) {
        if(this.body.force.y < 0) {
            this.standing = false

            this.body.force.y += this.body.gravity.y
            this.body.force.y = Math.round(this.body.force.y * 100) / 100

        }
        
        if(this.body.force.x < 0) {
            this.body.force.x += this.body.friction.x
            this.body.force.x = Math.round(this.body.force.x * 100) / 100
        }

        if(this.body.force.x > 0) {
            this.body.force.x -= this.body.friction.x
            this.body.force.x = Math.round(this.body.force.x * 100) / 100
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);
        // handle collisions against other shapes
        me.collision.check(this);


        // check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            StateManager.clearObserver("lastWord") //remove old observer
            // if yes reset the game
            me.game.world.removeChild(this);
            me.game.viewport.fadeIn("#fff", 150, function(){
                me.audio.play("die", false);
                me.levelDirector.reloadLevel();
                me.game.viewport.fadeOut("#fff", 150);
            });
            return true;
        }


        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
            (this.renderable && this.renderable.isFlickering())
        ) {
            this._super(me.Entity, "update", [dt]);
            return true;
        }
        return false; 
    },

    /**
     * colision handler
     */
    onCollision : function (response, other) {
        if(other.body.collisionType != me.collision.types.WORLD_SHAPE) {
            console.log(other.body.collisionType)
        }
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed("down") &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }

                // Custom collision response for slopes
                else if (other.type === "slope") {
                    // Always adjust the collision response upward
                    response.overlapV.y = Math.abs(response.overlap);
                    response.overlapV.x = 0;

                    // Respond to the slope (it is solid)
                    return true;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (!other.isMovingEnemy) {
                    // spike or any other fixed danger
                    this.body.vel.y -= this.body.maxVel.y * me.timer.tick;
                    this.hurt();
                }
                else {
                    // a regular moving enemy entity
                    if ((response.overlapV.y > 0) && this.body.falling) {
                        // jump
                        this.body.vel.y -= this.body.maxVel.y * 1.5 * me.timer.tick;
                    }
                    else {
                        this.hurt();
                    }
                    // Not solid
                    return false;
                }
                break;

            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }

        // Make the object solid
        return true;
    },


    /**
     * ouch
     */
    hurt : function () {
        if (!this.renderable.isFlickering())
        {
            this.renderable.flicker(750);
            // flash the screen
            me.game.viewport.fadeIn("#FFFFFF", 75);
            me.audio.play("die", false);
        }
    }
});
