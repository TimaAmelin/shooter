const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const playerSkins = ['arctic', 'astronaut', 'banana', 'chuck', 'hamster', 'king', 'redhood', 'sandwich', 'stealthy', 'swat'];
const monsterSkins = ['brain', 'bug', 'clown', 'demon', 'droid', 'monster', 'skeleton', 'water', 'werewolf', 'zombie'];

class MonsterSummoner {
    constructor () {
        this.timer = 500;
        this.monsters = [];
        this.rooms = [
            {
                left: 615,
                right: 1380,
                top: 610, 
                bottom: 1320
            },
            {
                left: 615,
                right: 1695,
                top: 1634, 
                bottom: 2002
            },
            {
                left: 615,
                right: 1695,
                top: 2318, 
                bottom: 3202
            },
            {
                left: 2000,
                right: 3145,
                top: 610, 
                bottom: 2002
            },
            {
                left: 2000,
                right: 3145,
                top: 2318, 
                bottom: 3202
            }
        ]
    };

    summon (player) {
        if (this.timer > 0) {
            this.timer--;
        } else  if (this.timer != -1) {
            const coords = this.generateCoords(player);
            const orientation = coords.x > player.x ? 'left' : 'right';
            const monster = new Monster(monsterSkins[Math.floor(Math.random() * 10)], coords.x, coords.y, orientation);
            this.monsters.push(monster);
            this.timer = 20 + 80 / (player.score / 10 + 1);
        };
    }

    generateCoords (player) {
        const roomNumber = Math.floor(Math.random() * 5);
        let x = Math.floor(Math.random() * (this.rooms[roomNumber].right - this.rooms[roomNumber].left + 1) + this.rooms[roomNumber].left);
        let y = Math.floor(Math.random() * (this.rooms[roomNumber].bottom - this.rooms[roomNumber].top + 1) + this.rooms[roomNumber].top);
        while (Math.abs(player.x - x) <= 150 && Math.abs(player.y - y) <= 150) {
            x = Math.floor(Math.random() * (this.rooms[roomNumber].right - this.rooms[roomNumber].left + 1) + this.rooms[roomNumber].left);
            y = Math.floor(Math.random() * (this.rooms[roomNumber].bottom - this.rooms[roomNumber].top + 1) + this.rooms[roomNumber].top);
        };
        return ({x, y});
    }

    draw1 (ctx, player) {
        this.monsters.sort((monster1, monster2) => monster1.y - monster2.y).map(monster => {
            if (monster.y < player.y && monster.alive) {
                ctx.drawImage(monster.skin, monster.x - player.x + player.shownx, monster.y - player.y + player.showny);
            };
        });
    }

    draw2 (ctx, player) {
        this.monsters.map(monster => {
            if (monster.y >= player.y && monster.alive) {
                ctx.drawImage(monster.skin, monster.x - player.x + player.shownx, monster.y - player.y + player.showny);
            };
        });
    }

    move (rooms, player) {
        this.monsters.map(monster => monster.move(rooms, player));
    }
}

class Monster {
    constructor (skinName, x, y, orientation) {
        this.skinName = skinName;
        this.orientation = orientation;
        this.skin = document.getElementById(this.skinName + ' ' + this.orientation);
        this.x = x;
        this.y = y;
        this.speed = 4;
        this.alive = true;
    }

    move (rooms, player) {
        let angle = Math.atan((player.y - this.y) / (player.x - this.x));
        if (player.x < this.x) {
            angle += Math.PI;
        };
        if (rooms.isLegalPlace(this.x + this.speed * Math.cos(angle), this.y)) {
            this.x += this.speed * Math.cos(angle);
        };
        if (rooms.isLegalPlace(this.x, this.y + this.speed * Math.sin(angle))) {
            this.y += this.speed * Math.sin(angle);
        };
        if (Math.abs(this.x - player.x) <= 30 && Math.abs(this.y - player.y) <= 50 && this.alive) {
            if (cheatCode.length > 0) {
                player.hp -= 20;
            } else {
                player.score += 1;
            };
            this.alive = false;
        };
    }
};

class Player {
    constructor () {
        this.skinName = 'sandwich';
        this.orientation = 'right';
        this.skin = document.getElementById(this.skinName + ' ' + this.orientation);
        this.x = 1000;
        this.y = 1000;
        this.shownx = 350;
        this.showny = 250;
        this.vSpeed = 4;
        this.hSpeed = 5;
        this.bulletSkin = document.getElementById('bullet');
        this.bulletIncX = 42;
        this.bulletIncY = 67;
        this.hp = 100;
        this.score = 0;
    }

    nextSkin () {
        const curNumber = playerSkins.indexOf(this.skin);
        if (curNumber === playerSkins.length - 1) {
            this.skin = playerSkins[0];
        } else {
            this.skin = playerSkins[curNumber + 1];
        };
    }

    left (rooms, c) {
        if (!c || rooms.isLegalPlace(this.x - this.hSpeed, this.y)) {
            this.x -= this.hSpeed;
        };
    }

    right (rooms, c) {
        if (!c || rooms.isLegalPlace(this.x + this.hSpeed, this.y)) {
            this.x += this.hSpeed;
        };
    }

    down (rooms, c) {
        if (!c || rooms.isLegalPlace(this.x, this.y + this.vSpeed)) {
            this.y += this.vSpeed;
        };
    }

    up (rooms, c) {
        if (!c || rooms.isLegalPlace(this.x, this.y - this.vSpeed)) {
            this.y -= this.vSpeed;
        };
    }

    drawHP (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(this.shownx - 6, this.showny - 25, 106, 20);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.shownx - 3, this.showny - 22, this.hp, 14);
    }

    draw (ctx) {
        this.skin = document.getElementById(this.skinName + ' ' + this.orientation);
        context.drawImage(this.skin, player.shownx, player.showny);
    }

    handleMovement (rooms, cheatCode) {
        if (isKeyDown('W')) {
            this.up(rooms, cheatCode.length);
        };
        if (isKeyDown('S')) {
            this.down(rooms, cheatCode.length);
        };
        if (isKeyDown('A')) {
            this.left(rooms, cheatCode.length);
        };
        if (isKeyDown('D')) {
            this.right(rooms, cheatCode.length);
        };
    }

    godMode () {
        this.hSpeed = 8;
        this.vSpeed = 10;
        this.bulletSkin = document.getElementById('bulletc');
        this.bulletIncX = 32;
        this.bulletIncY = 60;
    }
};

class Weapon {
    constructor () {
        this.skinName = 'Pythagoras';
        this.orientation = 'right';
        this.skin = document.getElementById(this.skinName + ' ' + this.orientation);
        this.shownx = 375;
        this.showny = 275;
        this.angle = 0;
    }

    draw (ctx) {
        this.angle = Math.atan((cursor.y - player.showny - 55) / (cursor.x - player.shownx - 30));
    
        this.skin = document.getElementById(this.skinName + ' ' + this.orientation);
    
        ctx.translate(player.shownx + 47, player.showny + 74);
        ctx.rotate(this.angle);
        ctx.drawImage(this.skin, -32, -22);
        ctx.rotate(-this.angle);
        ctx.translate(-1 * player.shownx - 47, -1 * player.showny - 74);
    }
};

class Cursor {
    constructor () {
        this.x = 0;
        this.y = 0;
        this.image = document.getElementById('cursor');
    }
};

class Background {
    constructor (id) {
        this.image = document.getElementById(id);
    }

    draw (ctx, plr) {
        ctx.drawImage(this.image, plr.shownx - plr.x, plr.showny - plr.y);
    }
};

class Bullet {
    constructor (x, y, angle, image) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.image = image;
        this.speed = 10;
        this.distance = 30;
    }

    move (rooms, monsters, player) {
        if (rooms.isLegalPlace(this.x + Math.cos(this.angle) * this.speed - 23, this.y + Math.sin(this.angle) * this.speed - 40) ||
        rooms.isLegalPlace(this.x + Math.cos(this.angle) * this.speed - 80, this.y + Math.sin(this.angle) * this.speed - 70) || !cheatCode.length) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            monsters.map(monster => {
                if (Math.abs(this.x - monster.x - 50) <= 30 && Math.abs(this.y - monster.y - 50) <= 50 && this.distance > 0 && monster.alive) {
                    monster.alive = false;
                    this.distance = 0;
                    player.score += 1;
                };
            });
            this.distance--;
        } else {
            this.distance = 0;
        };
    }

    draw (ctx, player) {
        ctx.drawImage(this.image, this.x - player.x + player.shownx, this.y - player.y + player.showny);
    }
};

class Rooms {
    isInRoom1 (x, y) {
        return x >= 615 && x <= 1380 && y >= 610 && y <= 1320;
    }

    isInRoom2 (x, y) {
        return x >= 615 && x <= 1695 && y >= 1634 && y <= 2002;
    }
    
    isInRoom3 (x, y) {
        return x >= 615 && x <= 1695 && y >= 2318 && y <= 3202;
    }

    isInRoom4 (x, y) {
        return x >= 2000 && x <= 3145 && y >= 610 && y <= 2002;
    }

    isInRoom5 (x, y) {
        return x >= 2000 && x <= 3145 && y >= 2318 && y <= 3202;
    }


    isOnBridge1 (x, y) {
        return x >= 930 && x <= 1065 && y >= 1266 && y <= 1662;
    }

    isOnBridge2 (x, y) {
        return x >= 1435 && x <= 1570 && y >= 1954 && y <= 2346;
    }
    
    isOnBridge3 (x, y) {
        return x >= 1685 && x <= 2010 && y >= 2834 && y <= 2970;
    }

    isOnBridge4 (x, y) {
        return x >= 2505 && x <= 2640 && y >= 1950 && y <= 2346;
    }

    isOnBridge5 (x, y) {
        return x >= 1370 && x <= 2010 && y >= 894 && y <= 1034;
    }

    isLegalPlace (x, y) {
        return this.isInRoom1(x, y) ||
            this.isInRoom2(x, y) ||
            this.isInRoom3(x, y) ||
            this.isInRoom4(x, y) ||
            this.isInRoom5(x, y) ||
            this.isOnBridge1(x, y) ||
            this.isOnBridge2(x, y) ||
            this.isOnBridge3(x, y) ||
            this.isOnBridge4(x, y) ||
            this.isOnBridge5(x, y);
    }
};

const player = new Player();

const weapon = new Weapon();

const cursor = new Cursor();

const background = new Background('playingBackground');
const backgroundOverlap = new Background('background overlap');

const rooms = new Rooms();

const monsterSummoner = new MonsterSummoner();

let cheatCode = [76, 79, 79, 67, 77, 73, 84];

let bullets = [];

let gameEngine;

const nextGameStep = (function () {
    return requestAnimationFrame ||
        webkitRequestAnimationFrame ||
        mozRequestAnimationFrame ||
        oRequestAnimationFrame ||
        msRequestAnimationFrame ||
        function (callback) {
            setTimeout(callback, 1000 / 60);
        };
})();

const gameEngineStart = callback => {
    gameEngine = callback;
    gameEngineStep();
};

const gameEngineStep = () => {
    gameEngine();
    nextGameStep(gameEngineStep);
};

const gameLoop = () => {
    if (playing) {
        player.handleMovement(rooms, cheatCode);
        monsterSummoner.summon(player);
        monsterSummoner.move(rooms, player);
    
        if (cursor.x >= player.shownx + 30) {
            player.orientation = 'right';
            weapon.orientation = 'right';
        } else {
            player.orientation = 'left';
            weapon.orientation = 'left';
        };
    
        background.draw(context, player);
    
        bullets.map(bullet => {
            if (bullet.distance > 0) {
                bullet.move(rooms, monsterSummoner.monsters, player);
                bullet.draw(context, player);
            };
        });
    
        monsterSummoner.draw1(context, player);
        player.draw(context);
        player.drawHP(context);
        weapon.draw(context);
        monsterSummoner.draw2(context, player);
        
        if (cheatCode.length !== 0) {
            backgroundOverlap.draw(context, player);
        };
        
    
        context.fillStyle = 'white';
        context.font = 'Bold 30px Arial';
        context.fillText('Score: ' + player.score, 20, 40);
    
        spaceTimer--;

        if (!player.hp) {
            playing = false;
        };
    } else {
        context.fillStyle = 'white';
        context.fillRect(0, 0, 800, 600);
        context.fillStyle = 'black';
        context.font = 'Bold 50px Arial';
        context.fillText('Click  to start', 240, 200);
    };
    
    context.drawImage(cursor.image, cursor.x, cursor.y);
};

const keys = {
    'W': 87,
    'S': 83,
    'A': 65,
    'D': 68,
    ' ': 32
};

let keyDown = {};

let spaceTimer = 0;

let playing = false;

const isKeyDown = keyName => {
    return keyDown[keys[keyName]] == true;
};

const clearKey = keyCode => {
    keyDown[keyCode] = false;
};

const setKey = keyCode => {
    keyDown[keyCode] = true;
};

window.onload = () => {
    window.onkeydown = function (e) {
        if (e.keyCode == 32) {
            e.preventDefault();
            if (spaceTimer <= 0) {
                player.nextSkin();
            };
        };
        setKey(e.keyCode);
        if (e.keyCode === cheatCode[cheatCode.length - 1]) {
            if (cheatCode.length === 1) {
                player.godMode();
                console.log('Добро пожаловать в режим бога! Теперь вы бессмертны и можете ходить сквозб стены и над лавой, также ваша скорость и количество выстрелов увеличена, а монстры умирают от соприкосновения с вами! Удачи в создании монстриного армагеддона!');
            };
            cheatCode.pop();
        };
    };

    window.onkeyup = e => {
        clearKey(e.keyCode);
    };

    window.onmousemove = e => {
        if (e.target === canvas) {
            cursor.x = e.offsetX - 16;
            cursor.y = e.offsetY - 16;
        };
    };

    window.onclick = e => {
        e.preventDefault();
        if (playing) {
            if (e.target === canvas) {
                let angle = Math.atan((cursor.y - player.showny - 55 + Math.floor(Math.random() * 60 - 30)) / (cursor.x - player.shownx - 30 + Math.floor(Math.random() * 36 - 18)));
                
                if (angle * weapon.angle < -0.5) {
                    angle += Math.PI;
                };
                if (player.orientation === 'left') {
                    angle += Math.PI;
                };
                
                const bullet = new Bullet(player.x + player.bulletIncX, player.y + player.bulletIncY, angle, player.bulletSkin);
                bullets.push(bullet);
    
                if (cheatCode.length === 0) {
                    const n = 4;
                    for (let i = 0; i < n - 1; i++) {
                        angle += 2 * Math.PI / n;
                        const bullet = new Bullet(player.x + player.bulletIncX, player.y + player.bulletIncY, angle, player.bulletSkin);
                        bullets.push(bullet);
                    }
                };
            };
        } else {
            player.x = 1000;
            player.y = 1000;
            player.hp = 100;
            player.score = 0;
            player.vSpeed = 4;
            player.hSpeed = 5;
            player.bulletSkin = document.getElementById('bullet');
            player.bulletIncX = 42;
            player.bulletIncY = 67;

            cheatCode = [76, 79, 79, 67, 77, 73, 84];
            
            monsterSummoner.monsters = [];
            bullets = [];

            playing = true;
        };
    };
};


gameEngineStart(gameLoop);