Real-Time Multiplayer Snake Game

Project Overview

This project is a real-time multiplayer Snake game where two players can compete against each other on a dynamic grid. The objective of the game is to grow your snake larger than the opponent by eating pellets, while avoiding collisions with the other player's snake or your own.

Game Objective:

Grow your snake by eating pellets on the grid.
Outgrow your opponent to win.
If a collision occurs (either between the two players or a player colliding with their own snake), the colliding player is reset to the starting size, while the other player's snake remains the same size and continues playing.
The game is powered by WebSockets to synchronize player movements and the positions of the snake segments and pellets in real time.

Key Features:
Real-Time Multiplayer: Two players can control their own snakes simultaneously and compete to eat pellets.
WebSocket Communication: WebSocket technology keeps the game state synchronized across both players in real time.
Dynamic Grid: The game grid is rendered in HTML, with updates to the snake segments and pellet positions controlled via JavaScript.
Score Tracking: Each player’s score is tracked based on the number of pellets they eat.
Collision Handling: When a player collides with the other player or their own snake, they are reset to the starting size. The other player’s snake continues playing without interruption.
Game Continuity: The game continues after a collision, with the surviving player growing their snake and trying to outgrow the opponent.
Technologies Used:

WebSockets: For real-time communication between players and server.
HTML5: For rendering the game grid and basic UI.
CSS3: For styling the game grid and UI components.
JavaScript: For handling game logic, player input, and WebSocket communication.