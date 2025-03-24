document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let Config = {};
    let player;
    let hasStarted = false;
    let gameRunning = false;
    let obstacles = [];
    let startTime = null;
    let progress = 100;
    let gameDuration = 10000;

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            if (!hasStarted && gameRunning) {
                hasStarted = true;
                startTime = Date.now();

                //hide hint
                const hint = document.getElementById("startHint");
                if (hint) hint.style.display = "none";
            }
        }

        if (!hasStarted || !gameRunning) return;

        switch (e.code) {
            case "ArrowUp":
                player.y -= player.speed;
                break;
            case "ArrowDown":
                player.y += player.speed;
                break;
            case "ArrowLeft":
                player.x -= player.speed;
                break;
            case "ArrowRight":
                player.x += player.speed;
                break;
            case "Escape":
                endGame(false);
                break;
        }
    });

    function startGame() {
        player = { x: 20, y: 140, radius: 5, speed: Config.playerSpeed };
        hasStarted = false;
        gameRunning = true;
        startTime = null;
        progress = 100;
        gameDuration = Config.gameDuration;
        obstacles = generateObstacles();
        requestAnimationFrame(gameLoop);

        const hint = document.getElementById("startHint");
        if (hint) hint.style.display = "block";

    }

    function generateObstacles() {
        const obs = [];
        for (let i = 60; i < 280; i += 40) {
            const gapY = Math.floor(Math.random() * (Config.obstacleGapMax - Config.obstacleGapMin)) + Config.obstacleGapMin;
            const speed = Math.random() * (Config.obstacleSpeedMax - Config.obstacleSpeedMin) + Config.obstacleSpeedMin;
            const direction = Math.random() < 0.5 ? 1 : -1;
            obs.push({ x: i, gapY: gapY, speed: speed, direction: direction });
        }
        return obs;
    }

    function gameLoop() {
        if (!gameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (hasStarted) {
            obstacles.forEach(obs => {
                obs.gapY += obs.speed * obs.direction;
                if (obs.gapY <= 50 || obs.gapY >= canvas.height - 50) {
                    obs.direction *= -1;
                }
            });
        }

        // Draw player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = "lime";
        ctx.fill();

        // Draw obstacles
        ctx.fillStyle = "#555";
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, 0, 10, obs.gapY - 40);
            ctx.fillRect(obs.x, obs.gapY + 40, 10, canvas.height - (obs.gapY + 40));
        });

        // Collision
        for (let obs of obstacles) {
            if (
                player.x + player.radius > obs.x &&
                player.x - player.radius < obs.x + 10
            ) {
                if (
                    player.y - player.radius < obs.gapY - 40 ||
                    player.y + player.radius > obs.gapY + 40
                ) {
                    endGame(false);
                    return;
                }
            }
        }

        // Win condition
        if (player.x > canvas.width - 20) {
            endGame(true);
            return;
        }

        // Out of bounds
        if (player.y < 0 || player.y > canvas.height || player.x < 0) {
            endGame(false);
            return;
        }

        // Progress bar
        if (hasStarted && startTime) {
            const elapsed = Date.now() - startTime;
            progress = Math.max(0, 100 - (elapsed / gameDuration) * 100);
            document.getElementById("progressBar").style.width = progress + "%";
            if (elapsed >= gameDuration) {
                endGame(false);
                return;
            }
        }

        requestAnimationFrame(gameLoop);
    }

    function endGame(success) {
        gameRunning = false;
        document.getElementById("game").style.display = "none";
        sendResult(success);
    }

    function sendResult(success) {
        fetch("https://dhani_minigame/gameResult", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success })
        });
    }

    // Ambil config dari client.lua
    window.addEventListener("message", function (event) {
        if (event.data.action === "openGame") {
            if (event.data.config) {
                Config = event.data.config;
            }
            document.getElementById("game").style.display = "block";
            startGame();
        }
    });
});
