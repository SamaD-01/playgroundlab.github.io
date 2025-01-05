// Game constants
const GAME_CONFIG = {
    MISSILE_SPEED: 100,
    ALIEN_SPEED: 800,
    BOARD_WIDTH: 9,
    BOARD_HEIGHT: 5,
    ASSETS: {
        BLANK: 'assets/blanc.jpg',
        SPACESHIP: 'assets/vaisseau.jpg',
        MISSILE: 'assets/missile.jpg',
        ALIEN: 'assets/alien.jpg',
        EXPLOSION: 'assets/explosion.png'
    }
};

class SpaceInvaders {
    constructor() {
        this.initializeGameState();
        this.setupEventListeners();
        this.startGame();
    }

    initializeGameState() {
        this.plan = Array.from({ length: GAME_CONFIG.BOARD_HEIGHT }, (_, i) =>
            Array.from(document.querySelectorAll(`.ligne${i + 1} img`))
        );
        
        this.gameState = {
            score: 0,
            isGameOver: false,
            missileLaunched: false
        };

        this.spaceship = {
            x: GAME_CONFIG.BOARD_HEIGHT - 1,
            y: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2)
        };

        this.alien = {
            x: 0,
            y: 0,
            direction: 1
        };
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        // Add touch support for mobile devices
        document.addEventListener('touchstart', this.handleTouch.bind(this));
    }

    handleKeyPress(event) {
        const KEYS = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            SPACE: 32
        };

        switch(event.keyCode) {
            case KEYS.LEFT:
            case KEYS.RIGHT:
                this.moveSpaceship(event.keyCode === KEYS.LEFT ? -1 : 1);
                break;
            case KEYS.UP:
            case KEYS.SPACE:
                this.launchMissile();
                break;
        }
    }

    handleTouch(event) {
        const touch = event.touches[0];
        const gameBoard = document.querySelector('.plan');
        const rect = gameBoard.getBoundingClientRect();
        const relativeX = touch.clientX - rect.left;
        
        if (relativeX < rect.width / 3) {
            this.moveSpaceship(-1);
        } else if (relativeX > (rect.width * 2) / 3) {
            this.moveSpaceship(1);
        } else {
            this.launchMissile();
        }
    }

    moveSpaceship(direction) {
        const newY = this.spaceship.y + direction;
        if (newY >= 0 && newY < GAME_CONFIG.BOARD_WIDTH) {
            this.updateCell(this.spaceship.x, this.spaceship.y, GAME_CONFIG.ASSETS.BLANK);
            this.spaceship.y = newY;
            this.updateCell(this.spaceship.x, this.spaceship.y, GAME_CONFIG.ASSETS.SPACESHIP);
        }
    }

    updateCell(x, y, asset) {
        if (this.plan[x] && this.plan[x][y]) {
            this.plan[x][y].src = asset;
        }
    }

    async launchMissile() {
        if (this.gameState.missileLaunched) return;

        this.gameState.missileLaunched = true;
        const missilePosition = {
            x: this.spaceship.x - 1,
            y: this.spaceship.y
        };

        while (missilePosition.x >= 0 && !this.gameState.isGameOver) {
            this.updateCell(missilePosition.x + 1, missilePosition.y, GAME_CONFIG.ASSETS.BLANK);
            this.updateCell(missilePosition.x, missilePosition.y, GAME_CONFIG.ASSETS.MISSILE);
            
            if (this.checkCollision(missilePosition)) {
                break;
            }
            
            await this.delay(GAME_CONFIG.MISSILE_SPEED);
            missilePosition.x--;
        }

        if (missilePosition.x >= 0) {
            this.updateCell(missilePosition.x, missilePosition.y, GAME_CONFIG.ASSETS.BLANK);
        }
        this.gameState.missileLaunched = false;
    }

    checkCollision(missilePos) {
        if (missilePos.x === this.alien.x && missilePos.y === this.alien.y) {
            this.handleAlienHit(missilePos);
            return true;
        }
        return false;
    }

    async handleAlienHit(position) {
        this.gameState.score += 100;
        this.updateCell(position.x, position.y, GAME_CONFIG.ASSETS.EXPLOSION);
        
        try {
            const audio = new Audio('assets/explosion.mp3');
            await audio.play();
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }

        await this.delay(500);
        this.updateCell(position.x, position.y, GAME_CONFIG.ASSETS.BLANK);
        this.spawnNewAlien();
    }

    async moveAlien() {
        while (!this.gameState.isGameOver) {
            const newY = this.alien.y + this.alien.direction;

            if (newY >= GAME_CONFIG.BOARD_WIDTH || newY < 0) {
                this.alien.direction *= -1;
                continue;
            }

            this.updateCell(this.alien.x, this.alien.y, GAME_CONFIG.ASSETS.BLANK);
            this.alien.y = newY;
            this.updateCell(this.alien.x, this.alien.y, GAME_CONFIG.ASSETS.ALIEN);

            await this.delay(GAME_CONFIG.ALIEN_SPEED);
        }
    }

    spawnNewAlien() {
        this.alien = {
            x: 0,
            y: Math.floor(Math.random() * GAME_CONFIG.BOARD_WIDTH),
            direction: Math.random() < 0.5 ? -1 : 1
        };
        this.updateCell(this.alien.x, this.alien.y, GAME_CONFIG.ASSETS.ALIEN);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startGame() {
        this.updateCell(this.spaceship.x, this.spaceship.y, GAME_CONFIG.ASSETS.SPACESHIP);
        this.spawnNewAlien();
        this.moveAlien();
    }
}

// Initialize game
const game = new SpaceInvaders();