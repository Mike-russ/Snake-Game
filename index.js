const express = require('express');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const wss = new WebSocket.WebSocketServer({ server: server });

// Define the board size
const numRows = 30;
const numCols = 30;

// Initialize the board
let board = [];
for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
        row.push(0); // 0 represents an empty cell
    }
    board.push(row);
}

// Initialize snake
let snake1 = [{ row: 0, col: 0 }];
let snake2 = [{ row: numRows - 1, col: numCols - 1 }];

// Combine snakes into a single array
let snakes = [snake1, snake2];

//player count
let player1Connected = false;
let player2Connected = false;

// Define pellet object
let pellet = {
    row: 0,
    col: 0
};

wss.on('connection', (ws) => {
    let playerNumber = null;

    // Check if player one slot is available
    if (!player1Connected) {
        playerNumber = 1;
        player1Connected = true;
    } else if (!player2Connected) {
        playerNumber = 2;
        player2Connected = true;
    }

    generatePellet();

    // Send initial game state to the client
    ws.send(JSON.stringify({ board, snakes, pellet, playerNumber }));

    ws.on('message', (message) => {
        // Handle player actions received from the client
        const { direction } = JSON.parse(message);

        moveSnake(direction, snakes[playerNumber - 1], playerNumber);

        // Send updated game state to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ board, snakes, pellet }));
            }
        });
    });

    ws.on('close', () => {
        // Update player connection status when a client disconnects
        if (playerNumber === 1) {
            player1Connected = false;
        } else if (playerNumber === 2) {
            player2Connected = false;
        }
    });
});

// Function to move the snake based on the provided direction
function moveSnake(direction, snake, playerNumber) {
    // Check if the player is allowed to move this snake
    if (!playerNumber) {
        // If the player is not allowed to move this snake, exit
        return;
    }

    // Determine the next position of the snake's head based on its current direction
    let nextRow = snake[0].row;
    let nextCol = snake[0].col;

    switch (direction) {
        case 'up':
            nextRow -= 1;
            break;
        case 'down':
            nextRow += 1;
            break;
        case 'left':
            nextCol -= 1;
            break;
        case 'right':
            nextCol += 1;
            break;
        default:
            return; // Exit if invalid direction
    }

    // Check if the next position is within the bounds of the game board
    if (nextRow < 0 || nextRow >= numRows || nextCol < 0 || nextCol >= numCols) {
        // If the snake hits the wall, end the game
        endGame(playerNumber);
        return;
    }

    // Check if the snake's head collides with itself or the other snake
    for (let i = 1; i < snake.length; i++) {
        if (nextRow === snake[i].row && nextCol === snake[i].col) {
            // If the snake collides with itself, end the game
            endGame(playerNumber);
            return;
        }
    }
    
    // Check if the snake's head collides with the other snake
    for (let i = 0; i < snakes.length; i++) {
        // Exclude the current player's snake from the collision check
        if (i !== playerNumber - 1) {
            for (let j = 0; j < snakes[i].length; j++) {
                if (nextRow === snakes[i][j].row && nextCol === snakes[i][j].col) {
                    // If the snake collides with the other snake, end the game
                    endGame(playerNumber);
                    return;
                }
            }
        }
    }

    // Move the snake to the next position
    const newHead = { row: nextRow, col: nextCol, direction: snake[0].direction };
    snake.unshift(newHead); // Add the new head to the beginning of the array

    // Check if the snake's head collides with the pellet
    if (pellet.row === snake[0].row && pellet.col === snake[0].col) {
        // Generate a new pellet
        generatePellet();
    } else {
        // Remove the tail segment to maintain the snake's length if no pellet is eaten
        snake.pop();
    }

    // Update the snake's direction
    snake[0].direction = snake[0].direction;

    // Send updated game state to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ board, snakes, pellet }));
        }
    });
}



// Function to generate a new pellet
function generatePellet() {
    pellet.row = Math.floor(Math.random() * numRows);
    pellet.col = Math.floor(Math.random() * numCols);
    while(!isPelletValid){
        pellet.row = Math.floor(Math.random() * numRows);
        pellet.col = Math.floor(Math.random() * numCols);
    }
}

function endGame(playerNumber) {
    let loser = playerNumber;

    if(playerNumber == 1){
        // Reset snake 1 to its initial position and length
        snakes[0] = [{ row: 0, col: 0 }];
    }

    if(playerNumber == 2){
        // Reset snake 2 to its initial position and length
        snakes[1] = [{ row: numRows - 1, col: numCols - 1 }];
    }

    // Send the game over event with the updated snake positions
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ board, snakes, pellet, loser }));
        }
    });

    console.log("Game Over: Player " + loser + " loses");
}

// Check if the pellet position is valid (not overlapping with any snake segments)
function isPelletValid() {
    for (const snake of snakes) {
        for (const segment of snake) {
            if (segment.row === pellet.row && segment.col === pellet.col) {
                return false;
            }
        }
    }
    return true;
}

// server.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//         wss.emit('connection', ws, request);
//     });
// });