// Daydream Maze Game Script
        // Game variables
        let canvas, ctx, miniMap, miniMapCtx;
        let gameActive = false;
        let score = 0;
        let level = 1;
        let lives = 3;
        let sacrifices = 0;
        let player;
        let maze = [];
        let mazeWidth = 25;
        let mazeHeight = 25;
        let cellSize = 20;
        let points = [];
        let enemies = [];
        let exit;
        let sacrificedKeys = {};
        let activeAbilities = {};
        let listenersAdded = false; // Prevent multiple listeners

        const area = document.getElementById('gameArea')
        const head = document.getElementById('head')
        const play = document.getElementById('play')

        // Initialize game
        function init() {
            canvas = document.getElementById('mazeCanvas');
            ctx = canvas.getContext('2d');

            // Set canvas dimensions
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;

            // Set up mini-map
            miniMap = document.getElementById('miniMap');
            miniMap.width = miniMap.offsetWidth;
            miniMap.height = miniMap.offsetHeight;
            miniMapCtx = miniMap.getContext('2d');

            // Adjust cell size based on canvas size
            cellSize = Math.min(Math.floor(canvas.width / mazeWidth), Math.floor(canvas.height / mazeHeight));

            // Initialize player
            player = {
                x: 1,
                y: 1,
                width: cellSize * 0.7,
                height: cellSize * 0.7,
                color: '#ff6b6b',
                speed: 1
            };

            // Generate initial maze
            generateMaze();

            // Set up event listeners only once
            if (!listenersAdded) {
                document.getElementById('startButton').addEventListener('click', startGame);
                document.getElementById('startButton').addEventListener('click', function(){
                    area.style.display = 'none'
                    head.style.display = 'none'
                    play.style.display = 'none'
                });
                document.getElementById('resetButton').addEventListener('click', resetGame);
                document.getElementById('resetButton').addEventListener('click', function(){
                    location.reload()
                });

                document.querySelectorAll('.sacrifice-option').forEach(option => {
                    option.addEventListener('click', function() {
                        if (!gameActive) return;

                        const key = this.getAttribute('data-key');
                        const ability = this.getAttribute('data-ability');

                        if (!sacrificedKeys[key]) {
                            sacrificeKey(key, ability);
                            this.classList.add('sacrificed');
                        }
                    });
                });

                document.addEventListener('keydown', handleKeyDown);

                listenersAdded = true;
            }

            // Draw initial state
            draw();
        }
        
        // Generate a random maze using Depth-First Search algorithm
        function generateMaze() {
            // Initialize maze with walls
            maze = [];
            for (let y = 0; y < mazeHeight; y++) {
                maze[y] = [];
                for (let x = 0; x < mazeWidth; x++) {
                    maze[y][x] = 1; // 1 represents a wall
                }
            }
            
            // Stack for DFS
            let stack = [];
            
            // Start from a random cell (ensuring it's odd to create proper paths)
            let startX = 1;
            let startY = 1;
            maze[startY][startX] = 0; // 0 represents a path
            
            stack.push([startX, startY]);
            
            // DFS algorithm to generate maze
            while (stack.length > 0) {
                let [x, y] = stack[stack.length - 1];
                
                // Find all unvisited neighbors
                let neighbors = [];
                
                // Check all four directions
                if (y - 2 > 0 && maze[y - 2][x] === 1) neighbors.push([x, y - 2, x, y - 1]);
                if (y + 2 < mazeHeight - 1 && maze[y + 2][x] === 1) neighbors.push([x, y + 2, x, y + 1]);
                if (x - 2 > 0 && maze[y][x - 2] === 1) neighbors.push([x - 2, y, x - 1, y]);
                if (x + 2 < mazeWidth - 1 && maze[y][x + 2] === 1) neighbors.push([x + 2, y, x + 1, y]);
                
                if (neighbors.length > 0) {
                    // Choose a random neighbor
                    let [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
                    
                    // Remove the wall between current cell and chosen neighbor
                    maze[wy][wx] = 0;
                    maze[ny][nx] = 0;
                    
                    // Push the neighbor to the stack
                    stack.push([nx, ny]);
                } else {
                    // Backtrack
                    stack.pop();
                }
            }
            
            // Create exit at bottom-right corner
            exit = { x: mazeWidth - 2, y: mazeHeight - 2 };
            maze[exit.y][exit.x] = 2; // 2 represents exit
            
            // Generate points randomly in the maze
            points = [];
            for (let i = 0; i < 10 + level * 2; i++) {
                let pointX, pointY;
                do {
                    pointX = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
                    pointY = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
                } while (maze[pointY][pointX] !== 0 || (pointX === 1 && pointY === 1));
                
                points.push({
                    x: pointX,
                    y: pointY,
                    collected: false
                });
            }
            
            // Generate enemies for higher levels
            enemies = [];
            if (level > 1) {
                for (let i = 0; i < level - 1; i++) {
                    let enemyX, enemyY;
                    do {
                        enemyX = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
                        enemyY = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
                    } while (maze[enemyY][enemyX] !== 0 || 
                            (enemyX === 1 && enemyY === 1) ||
                            (enemyX === exit.x && enemyY === exit.y));
                    
                    enemies.push({
                        x: enemyX,
                        y: enemyY,
                        direction: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
                        moveCounter: 0
                    });
                }
            }
        }
        
        // Start the game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('gameMessage').style.display = 'none';
            
            // Reset game state
            score = 0;
            level = 1;
            lives = 3;
            sacrifices = 0;
            
            generateMaze();
            player.x = 1;
            player.y = 1;
            
            updateUI();
            gameLoop();
        }
        
        // Reset the game
        function resetGame() {
            gameActive = false;
            document.getElementById('startButton').disabled = false;
            
            // Reset sacrificed keys
            sacrificedKeys = {};
            activeAbilities = {};
            
            // Reset UI for sacrificed keys
            document.querySelectorAll('.sacrifice-option').forEach(option => {
                option.classList.remove('sacrificed');
            });
            
            document.querySelectorAll('.keyboard-key').forEach(key => {
                key.classList.remove('sacrificed');
            });
            
            document.querySelectorAll('.ability').forEach(ability => {
                ability.classList.remove('active');
            });
            
            init();
        }
        
        // Main game loop
        function gameLoop() {
            if (!gameActive) return;
            
            update();
            draw();
            
            requestAnimationFrame(gameLoop);
        }
        
        // Update game state
        function update() {
            // Update player position based on active abilities
            if (activeAbilities.speed) {
                player.speed = 2;
            } else {
                player.speed = 1;
            }
            
            // Check if player reached the exit
            if (player.x === exit.x && player.y === exit.y) {
                levelUp();
                return;
            }
            
            // Check for point collection
            for (let i = 0; i < points.length; i++) {
                if (!points[i].collected && player.x === points[i].x && player.y === points[i].y) {
                    points[i].collected = true;
                    score += 10;
                    updateUI();
                }
            }
            
            // Update enemies
            if (!activeAbilities.freeze) {
                for (let i = 0; i < enemies.length; i++) {
                    enemies[i].moveCounter++;
                    
                    // Move enemy every 10 frames
                    if (enemies[i].moveCounter >= 10) {
                        enemies[i].moveCounter = 0;
                        
                        // Try to move in current direction, if blocked, change direction
                        let newX = enemies[i].x;
                        let newY = enemies[i].y;
                        
                        switch (enemies[i].direction) {
                            case 0: newY--; break; // Up
                            case 1: newX++; break; // Right
                            case 2: newY++; break; // Down
                            case 3: newX--; break; // Left
                        }
                        
                        // Check if new position is valid (not a wall)
                        if (newX >= 0 && newX < mazeWidth && newY >= 0 && newY < mazeHeight && 
                            maze[newY][newX] !== 1) {
                            enemies[i].x = newX;
                            enemies[i].y = newY;
                        } else {
                            // Change direction if blocked
                            enemies[i].direction = Math.floor(Math.random() * 4);
                        }
                        
                        // Check for collision with player
                        if (enemies[i].x === player.x && enemies[i].y === player.y) {
                            if (activeAbilities.shield) {
                                // Shield protects from one hit
                                activeAbilities.shield = false;
                                document.getElementById('ability-shield').classList.remove('active');
                            } else {
                                lives--;
                                updateUI();
                                
                                if (lives <= 0) {
                                    gameOver();
                                    return;
                                } else {
                                    // Reset player position
                                    player.x = 1;
                                    player.y = 1;
                                }
                            }
                        }
                    }
                }
            }
            
            // Update ability durations
            updateAbilities();
        }
        
        // Draw everything
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0f3460';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate offset to center the maze on the player
            const offsetX = (canvas.width - mazeWidth * cellSize) / 2;
            const offsetY = (canvas.height - mazeHeight * cellSize) / 2;
            
            // Draw maze
            for (let y = 0; y < mazeHeight; y++) {
                for (let x = 0; x < mazeWidth; x++) {
                    const cellX = offsetX + x * cellSize;
                    const cellY = offsetY + y * cellSize;
                    
                    if (maze[y][x] === 1) {
                        // Draw wall
                        ctx.fillStyle = '#2c3e50';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        
                        // Add texture to walls
                        ctx.fillStyle = '#34495e';
                        ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
                    } else if (maze[y][x] === 2) {
                        // Draw exit
                        ctx.fillStyle = '#feca57';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        
                        ctx.fillStyle = '#1a1a2e';
                        ctx.font = 'bold ' + (cellSize * 0.6) + 'px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('EXIT', cellX + cellSize/2, cellY + cellSize/2);
                    } else {
                        // Draw path
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    }
                }
            }
            
            // Draw points
            for (let i = 0; i < points.length; i++) {
                if (!points[i].collected) {
                    const pointX = offsetX + points[i].x * cellSize + cellSize/2;
                    const pointY = offsetY + points[i].y * cellSize + cellSize/2;
                    
                    ctx.fillStyle = '#feca57';
                    ctx.beginPath();
                    ctx.arc(pointX, pointY, cellSize/4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add glow effect if magnet ability is active
                    if (activeAbilities.magnet) {
                        ctx.shadowColor = '#feca57';
                        ctx.shadowBlur = 10;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            }
            
            // Draw enemies
            for (let i = 0; i < enemies.length; i++) {
                const enemyX = offsetX + enemies[i].x * cellSize + cellSize/2;
                const enemyY = offsetY + enemies[i].y * cellSize + cellSize/2;
                
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(enemyX, enemyY, cellSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw enemy eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(enemyX - cellSize/8, enemyY - cellSize/8, cellSize/10, 0, Math.PI * 2);
                ctx.arc(enemyX + cellSize/8, enemyY - cellSize/8, cellSize/10, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw player
            const playerX = offsetX + player.x * cellSize + cellSize/2;
            const playerY = offsetY + player.y * cellSize + cellSize/2;
            
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(playerX, playerY, cellSize/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw shield if active
            if (activeAbilities.shield) {
                ctx.strokeStyle = '#feca57';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(playerX, playerY, cellSize/2, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Draw mini-map
            drawMiniMap();
        }
        
        // Draw the mini-map
        function drawMiniMap() {
            if (!miniMapCtx) return; // Prevent error if not initialized
            const miniMapSize = miniMap.width;
            const cellSizeMini = miniMapSize / mazeWidth;

            // Clear mini-map
            miniMapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            miniMapCtx.fillRect(0, 0, miniMapSize, miniMapSize);

            // Draw maze on mini-map
            for (let y = 0; y < mazeHeight; y++) {
                for (let x = 0; x < mazeWidth; x++) {
                    if (maze[y][x] === 1) {
                        miniMapCtx.fillStyle = '#2c3e50';
                    } else if (maze[y][x] === 2) {
                        miniMapCtx.fillStyle = '#feca57';
                    } else {
                        miniMapCtx.fillStyle = '#1a1a2e';
                    }
                    
                    miniMapCtx.fillRect(x * cellSizeMini, y * cellSizeMini, cellSizeMini, cellSizeMini);
                }
            }
            
            // Draw player on mini-map
            miniMapCtx.fillStyle = '#ff6b6b';
            miniMapCtx.beginPath();
            miniMapCtx.arc(player.x * cellSizeMini + cellSizeMini/2, 
                          player.y * cellSizeMini + cellSizeMini/2, 
                          cellSizeMini/2, 0, Math.PI * 2);
            miniMapCtx.fill();
            
            // Draw enemies on mini-map
            miniMapCtx.fillStyle = '#ff6b6b';
            for (let i = 0; i < enemies.length; i++) {
                miniMapCtx.beginPath();
                miniMapCtx.arc(enemies[i].x * cellSizeMini + cellSizeMini/2, 
                              enemies[i].y * cellSizeMini + cellSizeMini/2, 
                              cellSizeMini/3, 0, Math.PI * 2);
                miniMapCtx.fill();
            }
            
            // Draw exit on mini-map
            miniMapCtx.fillStyle = '#feca57';
            miniMapCtx.fillRect(exit.x * cellSizeMini, exit.y * cellSizeMini, cellSizeMini, cellSizeMini);
        }
        
        // Handle keyboard input
        function handleKeyDown(e) {
            if (!gameActive || sacrificedKeys[e.code]) return;
            
            let newX = player.x;
            let newY = player.y;
            
            switch(e.code) {
                case 'ArrowUp':
                    newY--;
                    break;
                case 'ArrowDown':
                    newY++;
                    break;
                case 'ArrowLeft':
                    newX--;
                    break;
                case 'ArrowRight':
                    newX++;
                    break;
                case 'Space':
                    if (activeAbilities.teleport) {
                        // Teleport to a random empty cell
                        let teleportX, teleportY;
                        do {
                            teleportX = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
                            teleportY = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
                        } while (maze[teleportY][teleportX] !== 0);
                        
                        player.x = teleportX;
                        player.y = teleportY;
                        return;
                    }
                    break;
            }
            
            // Check if new position is valid (not a wall)
            if (newX >= 0 && newX < mazeWidth && newY >= 0 && newY < mazeHeight && 
                maze[newY][newX] !== 1) {
                player.x = newX;
                player.y = newY;
                
                // Check for collision with enemies
                for (let i = 0; i < enemies.length; i++) {
                    if (enemies[i].x === player.x && enemies[i].y === player.y) {
                        if (activeAbilities.shield) {
                            // Shield protects from one hit
                            activeAbilities.shield = false;
                            document.getElementById('ability-shield').classList.remove('active');
                        } else {
                            lives--;
                            updateUI();
                            
                            if (lives <= 0) {
                                gameOver();
                                return;
                            } else {
                                // Reset player position
                                player.x = 1;
                                player.y = 1;
                            }
                        }
                        break;
                    }
                }
            }
        }
        
        // Sacrifice a key to gain an ability
        function sacrificeKey(key, ability) {
            sacrificedKeys[key] = true;
            sacrifices++;

            // Update UI for sacrificed key
            const keyElem = document.querySelector(`.keyboard-key[data-key="${key}"]`);
            if (keyElem) keyElem.classList.add('sacrificed');

            // Activate ability
            activateAbility(ability);

            updateUI();
        }
        
        // Activate an ability
        function activateAbility(ability) {
            activeAbilities[ability] = true;
            
            // Update UI for active ability
            document.getElementById(`ability-${ability}`).classList.add('active');
            
            // Set ability duration (15 seconds)
            setTimeout(() => {
                activeAbilities[ability] = false;
                document.getElementById(`ability-${ability}`).classList.remove('active');
            }, 15000);
        }
        
        // Update ability durations
        function updateAbilities() {
            // This would track ability durations if we had multiple active
            // For simplicity, we're using timeouts in activateAbility
        }
        
        // Level up the game
        function levelUp() {
            level++;
            score += 100;
            
            // Generate new maze for the next level
            generateMaze();
            player.x = 1;
            player.y = 1;
            
            updateUI();
            
            // Show level up message
            const message = document.getElementById('gameMessage');
            message.textContent = `Level ${level}!`;
            message.style.display = 'block';
            
            setTimeout(() => {
                message.style.display = 'none';
            }, 2000);
        }
        
        // Game over
        function gameOver() {
            gameActive = false;
            document.getElementById('startButton').disabled = false;
            
            const message = document.getElementById('gameMessage');
            message.textContent = `Game Over! Final Score: ${score}`;
            message.style.display = 'block';
        }
        
        // Update the UI
        function updateUI() {
            document.getElementById('score').textContent = `score: ${score}`;
            document.getElementById('level').textContent = `level: ${level}`;
            document.getElementById('lives').textContent = `lives: ${lives}`;
            document.getElementById('sacrifices').textContent = sacrifices;
            
            // Update progress bar for next level
            const progress = document.querySelector('.progress');
            const progressPercent = (score % 100) / 100 * 100;
            if (progress) progress.style.width = `${progressPercent}%`;
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (canvas) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                
                // Regenerate maze with new cell size
                cellSize = Math.min(Math.floor(canvas.width / mazeWidth), Math.floor(canvas.height / mazeHeight));
            }
            if (miniMap) {
                miniMap.width = miniMap.offsetWidth;
                miniMap.height = miniMap.offsetHeight;
            }
            draw();
        });

        // Initialize the game when the page loads
        window.addEventListener('load', init);