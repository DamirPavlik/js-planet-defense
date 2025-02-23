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
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.stroke();
    }
}

class Game {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
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
    }

    /**
     * @param {CanvasRenderingContext2D} context - 2d rendering context of a canvas 
     */
    render(context) {
        this.planet.draw(context);
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
    game.render(ctx);
});