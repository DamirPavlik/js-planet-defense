class Planet {
    /**
     * @param {Game} game - the instace of a game that this planet belongs to.
     */
    constructor(game) {
        /** @type {Game} reference to the game instance */
        this.game = game;

        /** @type {number} x cord of planets center */
        this.x = this.game.width * 0.5;

        /** @type {number} y cord of planets center */
        this.y = this.game.height * 0.5;

        /** @type {number} planet radius */
        this.radius = 80;

        /** @type {HTMLImageElement} img of planet */
        this.image = document.querySelector("#planet");
    }

    /**
     * @param {CanvasRenderingContext2D} context - 2d rendering context of a canvas 
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

class Player {
    /**
     * @param {Game} game - the instace of a game that this player belongs to.
     */
    constructor(game) {
        /** @type {Game} Reference to the game instance */
        this.game = game;

        /** @type {number} X coordinate of the player's center */
        this.x = this.game.width * 0.5;

        /** @type {number} Y coordinate of the player's center */
        this.y = this.game.height * 0.5;

        /** @type {number} Radius of the player */
        this.radius = 40;

        /** @type {HTMLImageElement | null} The player sprite image */
        this.image = document.querySelector("#player");

        /** 
         * @type {[number, number, number, number] | undefined} 
         * The aim vector representing direction and distance to the target.
         * [aimX, aimY, dx, dy]:
         * - `aimX` (number): Normalized x-direction.
         * - `aimY` (number): Normalized y-direction.
         * - `dx` (number): Difference in x-coordinates.
         * - `dy` (number): Difference in y-coordinates.
         */
        this.aim;

        /** 
         * @type {number} The player's rotation angle in radians.
         */
        this.angle = 0;
    }

    /**
     * @param {CanvasRenderingContext2D} context - 2d rendering context of a canvas 
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
}

class Game {
    /**
     * @param {HTMLCanvasElement} canvas - the canvas element where the game is rendered.
    */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} the canvas element associated with the game */
        this.canvas = canvas;

        /** @type {number} width of the game canvas */
        this.width = this.canvas.width;

        /** @type {number} height of the game canvas */
        this.height = this.canvas.height;

        /** @type {Planet} the planet instance within the game */
        this.planet = new Planet(this);

        /** @type {Player} the player instance within the game */
        this.player = new Player(this);

        /** @type {boolean} debug mode */
        this.debug = true;
        
        /**
         * @type {{ x: number, y: number }}
        */
        this.mouse = {
            x: 0,
            y: 0
        }
        
        /**
         * @param {MouseEvent} e - The mouse event object
        */
        window.addEventListener("mousemove", e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });

        /**
         * @param {MouseEvent} e - the key up event object
        */
        window.addEventListener("keyup", e => {
            if (e.key === 'd') this.debug = !this.debug;
        })
    }

    /**
     * @param {CanvasRenderingContext2D} context - 2d rendering context of a canvas 
     */
    render(context) {
        this.planet.draw(context);
        this.player.draw(context);
        this.player.update();
        context.beginPath();
    }
    
    /**
     * Calculates the aim direction and distance between two points.
     * @param {{ x: number, y: number }} a - The first point.
     * @param {{ x: number, y: number }} b - The second point.
     * @returns {[number, number, number, number]} A tuple containing:
     *   - `aimX` (number): The normalized x-direction.
     *   - `aimY` (number): The normalized y-direction.
     *   - `dx` (number): The difference in x-coordinates.
     *   - `dy` (number): The difference in y-coordinates.
     */
    calcAim(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        const aimX = dx / distance * -1;
        const aimY = dy / distance * -1;

        return [aimX, aimY, dx, dy];
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

    const game = new Game(canvas);
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate);
});