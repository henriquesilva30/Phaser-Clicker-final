var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add('play', {
    preload: function() {
        this.game.load.image('background1', 'assets/parallax_forest_pack/layers/background.png');
        this.game.load.image('background2', 'assets/parallax_forest_pack/layers/background2.png');
        this.game.load.image('forest-middle', 'assets/parallax_forest_pack/layers/parallax-forest-middle-trees.png');
        this.game.load.image('forest-front', 'assets/parallax_forest_pack/layers/parallax-forest-front-trees.png');

        this.game.load.image('bart', 'assets/allacrost_enemy_sprites/bart.png');
        this.game.load.image('homer', 'assets/allacrost_enemy_sprites/homer.png');
        this.game.load.image('lisa', 'assets/allacrost_enemy_sprites/lisa.png');
        this.game.load.image('marge', 'assets/allacrost_enemy_sprites/marge.png');
        this.game.load.image('maggie', 'assets/allacrost_enemy_sprites/maggie.jpg');

        this.game.load.image('aurum-drakueli', 'assets/allacrost_enemy_sprites/aurum-drakueli.png');
        this.game.load.image('bat', 'assets/allacrost_enemy_sprites/bat.png');
        this.game.load.image('daemarbora', 'assets/allacrost_enemy_sprites/daemarbora.png');
        this.game.load.image('deceleon', 'assets/allacrost_enemy_sprites/deceleon.png');
        this.game.load.image('demonic_essence', 'assets/allacrost_enemy_sprites/demonic_essence.png');
        this.game.load.image('dune_crawler', 'assets/allacrost_enemy_sprites/dune_crawler.png');
        this.game.load.image('green_slime', 'assets/allacrost_enemy_sprites/green_slime.png');
        this.game.load.image('nagaruda', 'assets/allacrost_enemy_sprites/nagaruda.png');
        this.game.load.image('rat', 'assets/allacrost_enemy_sprites/rat.png');
        this.game.load.image('scorpion', 'assets/allacrost_enemy_sprites/scorpion.png');
        this.game.load.image('skeleton', 'assets/allacrost_enemy_sprites/skeleton.png');
        this.game.load.image('snake', 'assets/allacrost_enemy_sprites/snake.png');
        this.game.load.image('spider', 'assets/allacrost_enemy_sprites/spider.png');
        this.game.load.image('stygian_lizard', 'assets/allacrost_enemy_sprites/stygian_lizard.png');

        this.game.load.image('donut_pink', 'assets/496_RPG_icons/donut_pink.png');

        this.game.load.image('fist', 'assets/496_RPG_icons/fist.png');
        this.game.load.image('nest', 'assets/496_RPG_icons/nest.png');
        this.game.load.image('firePunch', 'assets/496_RPG_icons/firepunch_alpha.gif');

        this.game.load.audio('theme','assets/audio/theme.mp3');
        this.game.load.audio('canon','assets/audio/canon.mp3');
        this.game.load.audio('hurt','assets/audio/hurt.wav');
        this.game.load.audio('point','assets/audio/points.mp3');
        this.game.load.audio('spawn','assets/audio/bossspawn.mp3');




        // build panel for upgrades
        var bmd = this.game.add.bitmapData(450, 500);
        bmd.ctx.fillStyle = '#5262de';
        bmd.ctx.strokeStyle = '#000000';
        bmd.ctx.lineWidth = 6;
        bmd.ctx.fillRect(0, 0, 250, 500);
        bmd.ctx.strokeRect(0, 0, 250, 500);
        this.game.cache.addBitmapData('upgradePanel', bmd);

        var buttonImage = this.game.add.bitmapData(476, 48);
        buttonImage.ctx.fillStyle = '#dbd93d';
        buttonImage.ctx.strokeStyle = '#000000';
        buttonImage.ctx.lineWidth = 2;
        buttonImage.ctx.fillRect(0, 0, 225, 48);
        buttonImage.ctx.strokeRect(0, 0, 225, 48);
        this.game.cache.addBitmapData('button', buttonImage);

        // the main player
        this.player = {
            clickDmg: 2,
            gold: 500,
            dps: 0
        };

        // world progression
        this.level = 1;
        // how many monsters have we killed during this level
        this.levelKills = 0;
        // how many monsters are required to advance a level
        this.levelKillsRequired = 10;
    },
    create: function() {
        var state = this;

        this.background = this.game.add.group();
        // setup each of our background layers to take the full screen
        ['background1','background2']
            .forEach(function(image) {
                var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
                    state.game.world.height, image, '', state.background);
                bg.tileScale.setTo(4,4);
            });

            
        this.upgradePanel = this.game.add.image(550, 70, this.game.cache.getBitmapData('upgradePanel'));
        var upgradeButtons = this.upgradePanel.addChild(this.game.add.group());
        upgradeButtons.position.setTo(8, 8);

        var upgradeButtonsData = [
            {icon: 'fist', name: 'Punch', level: 0, cost: 5, purchaseHandler: function(button, player) {
                player.clickDmg += 1;
            }},
            {icon: 'firePunch', name: 'Multi-Punch', level: 0, cost: 15, purchaseHandler: function(button, player) {
                player.dps += 5;
            }},
            {icon: 'nest', name: 'Nest', level: 0, cost: 35, purchaseHandler: function(button, player) {
                player.clickDmg += 15;
            }}
        ];

        var button;
        upgradeButtonsData.forEach(function(buttonData, index) {
            button = state.game.add.button(0, (50 * index), state.game.cache.getBitmapData('button'));
            button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
            button.text = button.addChild(state.game.add.text(42, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Helvetica Black'}));
            button.details = buttonData;
            button.costText = button.addChild(state.game.add.text(42, 24, 'Cost: ' + buttonData.cost, {font: '16px Helvetica Black'}));
            button.events.onInputDown.add(state.onUpgradeButtonClick, state);

            upgradeButtons.addChild(button);
        });

        var monsterData = [
            {name: 'Bart',        image: 'bart',        maxHealth: 60},
            {name: 'Homer',        image: 'homer',        maxHealth: 100},
            {name: 'Lisa',        image: 'lisa',        maxHealth: 30},
            {name: 'Marge',        image: 'marge',        maxHealth: 70},
            {name: 'Maggie',        image: 'maggie',        maxHealth: 10},
          
        ];
        this.monsters = this.game.add.group();

        var monster;
        monsterData.forEach(function(data) {
            // create a sprite for them off screen
            monster = state.monsters.create(1000, state.game.world.centerY, data.image);
            // use the built in health component
            monster.health = monster.maxHealth = data.maxHealth;
            // center anchor
            monster.anchor.setTo(0.5, 1);
            // reference to the database
            monster.details = data;

            //enable input so we can click it!
            monster.inputEnabled = true;
            monster.events.onInputDown.add(state.onClickMonster, state);

            // hook into health and lifecycle events
            monster.events.onKilled.add(state.onKilledMonster, state);
            monster.events.onRevived.add(state.onRevivedMonster, state);
        });

        // display the monster front and center
        this.currentMonster = this.monsters.getRandom();
        this.currentMonster.position.set(this.game.world.centerX, this.game.world.centerY + 100);

        this.monsterInfoUI = this.game.add.group();
        this.monsterInfoUI.position.setTo(this.currentMonster.x - 470, this.currentMonster.y - 120);
        this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(100, 0, this.currentMonster.details.name, {
            font: '48px Helvetica Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(115, 80, this.currentMonster.health + ' HP', {
            font: '32px Helvetica Black',
            fill: '#ff0000',
            strokeThickness: 4
        }));
        

        this.dmgTextPool = this.add.group();
        var dmgText;
        for (var d=0; d<50; d++) {
            dmgText = this.add.text(0, 0, '1', {
                font: '64px Helvetica Black',
                fill: '#fff',
                strokeThickness: 4
            });
            // start out not existing, so we don't draw it yet
            dmgText.exists = false;
            dmgText.tween = game.add.tween(dmgText)
                .to({
                    alpha: 0,
                    y: 100,
                    x: this.game.rnd.integerInRange(100, 700)
                }, 1000, Phaser.Easing.Cubic.Out);

            dmgText.tween.onComplete.add(function(text, tween) {
                text.kill();
            });
            this.dmgTextPool.add(dmgText);
        }

        // create a pool of gold coins
        this.coins = this.add.group();
        this.coins.createMultiple(50, 'donut_pink', '', false);
        this.coins.setAll('inputEnabled', true);
        this.coins.setAll('goldValue', 1);
        this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

        this.playerGoldText = this.add.text(30, 30, 'Donuts: ' + this.player.gold, {
            font: '24px Helvetica Black',
            fill: '#fff',
            strokeThickness: 4
        });

        // 1000ms 1x a second
        this.dpsTimer = this.game.time.events.loop(500, this.onDPS, this);

        // setup the world progression display
        this.levelUI = this.game.add.group();
        this.levelUI.position.setTo(this.game.world.centerX, 30);
        this.levelText = this.levelUI.addChild(this.game.add.text(-370, 500, 'Level: ' + this.level, {
            font: '24px Helvetica Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.levelKillsText = this.levelUI.addChild(this.game.add.text(-370, 530, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, {
            font: '24px Helvetica Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.theme = this.sound.add("theme");
        this.theme.play();
        this.theme.setLoop;

    },
    onDPS: function() {
        if (this.player.dps > 0) {
            if (this.currentMonster && this.currentMonster.alive) {
                // this.canon = this.sound.add("canon");
                // this.canon.play();
                var dmg = this.player.dps / 10;
                this.currentMonster.damage(dmg);
                // update the health text
                this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';
            }
        }
    },
    onUpgradeButtonClick: function(button, pointer) {
        // make this a function so that it updates after we buy
        function getAdjustedCost() {
            return Math.ceil(button.details.cost + (button.details.level * 1.46));
        }

        if (this.player.gold - getAdjustedCost() >= 0) {
            this.player.gold -= getAdjustedCost();
            this.playerGoldText.text = 'Donuts: ' + this.player.gold;
            button.details.level++;
            button.text.text = button.details.name + ': ' + button.details.level;
            button.costText.text = 'Cost: ' + getAdjustedCost();
            button.details.purchaseHandler.call(this, button, this.player);
        }
    },
    onClickCoin: function(coin) {
        if (!coin.alive) {
            return;
        }
        // give the player gold
        this.player.gold += coin.goldValue;
        this.point = this.sound.add("point");
        this.point.play();
        // update UI
        this.playerGoldText.text = 'Donuts: ' + this.player.gold;
        // remove the coin
        coin.kill();
    },
    onKilledMonster: function(monster) {
        // move the monster off screen again
        monster.position.set(1000, this.game.world.centerY);

        var coin;
        // spawn a coin on the ground
        coin = this.coins.getFirstExists(false);
        coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
        coin.goldValue = Math.round(this.level * 1.13);
        this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

        this.levelKills++;

        if (this.levelKills >= this.levelKillsRequired) {
            this.level++;
            this.levelKills = 0;
        }

        this.levelText.text = 'Level: ' + this.level;
        this.levelKillsText.text = 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired;

        // pick a new monster
        this.currentMonster = this.monsters.getRandom();
        // upgrade the monster based on level
        this.currentMonster.maxHealth = Math.ceil(this.currentMonster.details.maxHealth + ((this.level - 1) * 10.6));
        // make sure they are fully healed
        this.currentMonster.revive(this.currentMonster.maxHealth);
    },
    onRevivedMonster: function(monster) {
        monster.position.set(this.game.world.centerX, this.game.world.centerY + 100);
        // update the text display
        this.monsterNameText.text = monster.details.name;
        this.monsterHealthText.text = monster.health + 'HP';
        this.spawn = this.sound.add('spawn');
        this.spawn.play();
    },
    onClickMonster: function(monster, pointer) {
        // apply click damage to monster
        this.currentMonster.damage(this.player.clickDmg);

        // grab a damage text from the pool to display what happened
        var dmgText = this.dmgTextPool.getFirstExists(false);
        if (dmgText) {
            dmgText.text = this.player.clickDmg;
            dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
            dmgText.alpha = 1;
            dmgText.tween.start();
        }
        this.hurt = this.sound.add("hurt");
        this.hurt.play();
        // update the health text
        this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';
    }
});

game.state.start('play');
