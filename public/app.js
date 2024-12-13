var socket = new WebSocket("wss://s24-websocket-mike-russ.onrender.com");

var app = Vue.createApp({
    data: function () {
        return {
            board: [],
            snakes: [], // Array to store data for multiple snakes
            pellet: null,
            playerNumber: null,
        };
    },
    created: function () {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.loser !== undefined) {
                const { board, snakes, pellet, playerNumber, loser } = data;
                this.board = board;
                this.snakes = snakes;
                this.pellet = pellet;
                this.playerNumber = playerNumber;
                const losingPlayer = loser;
            } else {
                // Update game state
                const { board, snakes, pellet, playerNumber } = data;
                this.board = board;
                this.snakes = snakes;
                this.pellet = pellet;
                this.playerNumber = playerNumber;
            }
        };
    },
    methods: {
        isSnake(rowIndex, colIndex) {
            // Check if the current cell position is occupied by any snake
            for (const snake of this.snakes) {
                for (const segment of snake) {
                    if (segment.row === rowIndex && segment.col === colIndex) {
                        return true;
                    }
                }
            }
            return false;
        },
        isPellet(rowIndex, colIndex) {
            // Check if the current cell position contains the pellet
            return this.pellet && this.pellet.row === rowIndex && this.pellet.col === colIndex;
        }
    }
});

var vm = app.mount("#app");

window.addEventListener('keydown', (event) => {
    // Check if playerNumber is truthy and not equal to null
    if (vm.playerNumber !== null) {
        // Determine the direction based on the pressed arrow key
        let direction;
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            default:
                return; // Exit if key pressed is not an arrow key
        }

        // Send direction data to the server via WebSocket
        const action = {
            direction,
            playerNumber: vm.playerNumber
        };
        socket.send(JSON.stringify(action));
    }
});
