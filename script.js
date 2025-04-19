class Planet {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {number} */
        this.x = this.game.width * 0.5;

        /** @type {number} */
        this.y = this.game.height * 0.5;

        /** @type {number} */
        this.radius = 80;

        /** @type {HTMLImageElement} */
        this.image = document.querySelector("#planet");
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.drawImage(this.image, this.x - 100, this.y - 100);
        if (this.game.debug) {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.stroke();
        }
    }
}

class Projectile {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {number} */
        this.x;

        /** @type {number} */
        this.y;

        /** @type {number} */
        this.radius = 5;

        /** @type {number} */
        this.speedX = 1;

        /** @type {number} */
        this.speedY = 1;

        this.speedModified = 5;

        /** @type {boolean} */
        this.free = true;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} speedX
     * @param {number} speedY
     */
    start(x, y, speedX, speedY) {
        this.free = false;
        this.x = x;
        this.y = y;
        this.speedX = speedX * this.speedModified;
        this.speedY = speedY * this.speedModified;
    }

    reset() {
        this.free = true;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        if (!this.free) {
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fillStyle = "gold";
            context.fill();
            context.restore();
        }
    }

    update() {
        if (!this.free) {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
            this.reset();
        }
    }
}

class Enemy {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {number} */
        this.x = 100;

        /** @type {number} */
        this.y = 100;

        /** @type {number} */
        this.radius = 40;
        
        /** @type {number} */
        this.width = this.radius * 2;

        /** @type {number} */
        this.height = this.radius * 2;

        /** @type {number} */
        this.speedX = 0;

        /** @type {number} */
        this.speedY = 0;

        /** @type {number} */
        this.angle = 0;

        /** @type {boolean} */
        this.collided = false;

        /** @type {boolean} */
        this.free = true;
    }

    start() {
        this.free = false;
        this.collided = false;
        this.frameY = Math.floor(Math.random() * 4);
        this.frameX = 0;
        this.lives = this.maxLives;
        if (Math.random() < 0.5) {
            this.x = Math.random() * this.game.width;
            this.y = Math.random() < 0.5 ?  -this.radius : this.game.height + this.radius;
        } else {
            this.x = Math.random() < 0.5 ? -this.radius : this.game.width + this.radius;
            this.y = Math.random() * this.game.height;
        }
        
        const aim = this.game.calcAim(this, this.game.planet);
        this.speedX = aim[0];
        this.speedY = aim[1];
        
        this.angle = Math.atan2(aim[3], aim[2]) + Math.PI * 0.5;
    }

    reset() {
        this.free = true;
    }

    /**
     * @param {number} damage 
     */
    hit(damage) {
        this.lives -= damage;
        if (this.lives >= 1) this.frameX++;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        if (!this.free) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(
                this.image,
                this.frameX * this.width, 
                this.frameY * this.height, 
                this.width, 
                this.height, 
                -this.radius, 
                -this.radius, 
                this.width, this.height
            );
            
            if (this.game.debug) {
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.stroke();

                context.fillText(this.lives, 0, 0);
            }
            context.restore();
        }
    }

    update() {
        if (!this.free) {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.game.checkCollision(this, this.game.planet)) {
                this.lives = 0;
                this.speedX = 0;
                this.speedY = 0;
                this.collided = true;
            }

            if (this.game.checkCollision(this, this.game.player)) {
                this.lives = 0;
                this.collided = true;
            }

            this.game.projectilePool.forEach(p => {
                if (!p.free && this.game.checkCollision(this, p) && this.lives >= 1) {
                    p.reset();
                    this.hit(1);
                }
            });
            if (this.lives < 1 && this.game.spriteUpdate) {
                this.frameX++;

            }
            if (this.frameX > this.maxFrame) {
                this.reset();
                if (!this.collided) this.game.score += this.maxLives;
            }
        }
    }
}

class Asteroid extends Enemy {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        super(game);
        
        /** @type {HTMLImageElement} */
        this.image = document.querySelector("#asteroid");

        /** @type {number} */
        this.frameY = Math.floor(Math.random() * 4);

        /** @type {number} */
        this.frameX = 0;

        /** @type {number} */
        this.lives = 1;

        /** @type {number} */
        this.maxFrame = 7;

        /** @type {number} */
        this.maxLives = this.lives;
    }
}

class Lobstermorph extends Enemy {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        super(game);
        
        /** @type {HTMLImageElement} */
        this.image = document.querySelector("#lobstermorph");

        /** @type {number} */
        this.frameY = Math.floor(Math.random() * 4);

        /** @type {number} */
        this.frameX = 0;

        /** @type {number} */
        this.lives = 8;

        /** @type {number} */
        this.maxFrame = 14;

        /** @type {number} */
        this.maxLives = this.lives;
    }
}

class Player {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {number} */
        this.x = this.game.width * 0.5;

        /** @type {number} */
        this.y = this.game.height * 0.5;

        /** @type {number} */
        this.radius = 40;

        /** @type {HTMLImageElement | null} */
        this.image = document.querySelector("#player");

        /** 
         * @type {[number, number, number, number] | undefined} 
         */
        this.aim;

        /** 
         * @type {number} 
         */
        this.angle = 0;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, -this.radius, -this.radius);

        if (this.game.debug) {
            context.beginPath();
            context.arc(0, 0, this.radius, 0, Math.PI * 2);
            context.stroke();
        }

        context.restore();
    }

    update() {
        this.aim = this.game.calcAim(this.game.planet, this.game.mouse);

        this.x = this.game.planet.x + (this.game.planet.radius + this.radius) * this.aim[0];
        this.y = this.game.planet.y + (this.game.planet.radius + this.radius) * this.aim[1];

        this.angle = Math.atan2(this.aim[3], this.aim[2]);
    }

    shoot() {
        /** @type {Projectile} */
        const projectile = this.game.getProjectile();
        if (projectile) projectile.start(this.x + this.radius * this.aim[0], this.y + this.radius * this.aim[1], this.aim[0], this.aim[1]);
    }
}

class Game {
    /**
     * @param {HTMLCanvasElement} canvas 
    */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;

        /** @type {number} */
        this.width = this.canvas.width;

        /** @type {number} */
        this.height = this.canvas.height;

        /** @type {Planet} */
        this.planet = new Planet(this);

        /** @type {Player} */
        this.player = new Player(this);

        /** @type {boolean} */
        this.debug = true;

        /** @type {Projectile[]} */
        this.projectilePool = [];

        /** @type {number} */
        this.numberOfProjectiles = 30;

        this.createProjectilePool();

        /** @type {Enemy[]} */
        this.enemyPool = [];

        /** @type {number} */
        this.numberOfEnemies = 20;

        this.createEnemyPool();
        
        this.enemyPool[0].start();

        /** @type {number} */
        this.enemyTimer = 0;

        /** @type {number} */
        this.enemyInterval = 1700;

        /** @type {boolean} */
        this.spriteUpdate = false;

        /** @type {number} */
        this.spriteTimer = 0;

        /** @type {number} */
        this.spriteInterval = 150;

        /** @type {number} */
        this.score = 0;

        /** @type {number} */
        this.winningScore = 10;

        /** @type {boolean} */
        this.gameOver = false;

        /**
         * @type {{ x: number, y: number }}
        */
        this.mouse = {
            x: 0,
            y: 0
        }
        
        /**
         * @param {MouseEvent} e 
        */
        window.addEventListener("mousemove", e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });

        /**
         * @param {MouseEvent} e 
        */
        window.addEventListener("mousedown", e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.player.shoot();
        });

        /**
         * @param {MouseEvent} e 
        */
        window.addEventListener("keyup", e => {
            if (e.key === 'd') this.debug = !this.debug;
            if (e.key === '1') this.player.shoot();
        })
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} deltaTime
     */
    render(context, deltaTime) {
        this.planet.draw(context);
        this.drawStatusText(context);
        this.player.draw(context);
        this.player.update();

        this.projectilePool.forEach(p => {
            p.draw(context);
            p.update();
        });

        this.enemyPool.forEach(e => {
            e.draw(context);
            e.update();
        });

        if (!this.gameOver) {
            if (this.enemyTimer < this.enemyInterval) {
                this.enemyTimer += deltaTime;
            } else {
                this.enemyTimer = 0;
                const enemy = this.getEnemy();
                if (enemy) enemy.start();
            }
        }

        if (this.enemyTimer < this.enemyInterval) {
            this.enemyTimer += deltaTime;
        } else {
            this.enemyTimer = 0;
            const enemy = this.getEnemy();
            if (enemy) enemy.start();
        }

        if (this.spriteTimer < this.spriteInterval) {
            this.spriteTimer += deltaTime;
            this.spriteUpdate = false;
        } else {
            this.spriteTimer = 0;
            this.spriteUpdate = true;
        }

        if (this.score >= this.winningScore) {
            this.gameOver = true;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     */
    drawStatusText(context) {
        context.save();
        context.textAlign = 'left';
        context.font = '30px Impact';
        context.fillText("Score: " + this.score, 20,  30);
        context.restore();

        if (this.gameOver) {
            context.textAlign = 'center';
            /** @type {string} */
            let msg1;
            /** @type {string} */
            let msg2;

            if (this.score >= this.winningScore) {
                msg1 = "You win!";
                msg2 = "Your score is " + this.score + "!";
            }
            context.font = '100px Impact';
            context.fillText(msg1, this.width * 0.5, 200);
            context.font = '50px Impact';
            context.fillText(msg2, this.width * 0.5, 550);
        }
    }
    
    /**
     * @param {{ x: number, y: number }} a 
     * @param {{ x: number, y: number }} b 
     * @returns {[number, number, number, number]} 
     */
    calcAim(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        const aimX = dx / distance * -1;
        const aimY = dy / distance * -1;

        return [aimX, aimY, dx, dy];
    }

    /**
     * @param {{ x: number, y: number, radius: number }} a 
     * @param {{ x: number, y: number, radius: number }} b 
     * @returns {boolean}
     */
    checkCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distacne = Math.hypot(dx, dy);
        const sumOfRadii = a.radius + b.radius;

        return distacne < sumOfRadii;
    }

    createProjectilePool() {
        for (let i = 0; i < this.numberOfProjectiles; ++i) {
            this.projectilePool.push(new Projectile(this));
        }
    }

    getProjectile() {
        for (let i = 0; i < this.projectilePool.length; ++i) {
            if (this.projectilePool[i].free) return this.projectilePool[i];
        }
    }

    createEnemyPool() {
        for (let i = 0; i < this.numberOfEnemies; ++i) {
            // this.enemyPool.push(new Asteroid(this));
            this.enemyPool.push(new Lobstermorph(this));
        }
    }

    getEnemy() {
        for (let i = 0; i < this.enemyPool.length; ++i) {
            if (this.enemyPool[i].free) return this.enemyPool[i];
        }
    }
} 

window.addEventListener("load", function() {
    /** @type {HTMLCanvasElement | null} */
    const canvas = document.querySelector("#canvas1");

    if (!canvas) return;

    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 800;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.font = "50px Helvetica";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const game = new Game(canvas);

    let lastTime = 0;
    /**
     * @param {number} timeStamp 
     */
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});