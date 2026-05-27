class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.bodyKeys = [
            'purple_body_circle', 'blue_body_square', 'green_body_rhombus',
            'pink_body_circle', 'red_body_rhombus', 'yellow_body_square',
            'blue_body_circle', 'green_body_square', 'pink_body_rhombus'
        ];
        this.faceKeys = [
            'face_smile_open_eye', 'face_smile_open_eye_2', 'face_smile_open_eye_3',
            'face_smile_closed_eye', 'face_frown_open_eye', 'face_frown_open_eye_2',
            'face_frown_closed_eye', 'face_frown_closed_eye_2', 'face_grimace_open_eye'
        ];

        for (const key of this.bodyKeys) {
            this.load.image(key, 'assets/' + key + '.png');
        }
        for (const key of this.faceKeys) {
            this.load.image(key, 'assets/' + key + '.png');
        }
    }

    create() {
        this.clickCount = 0;
        this.characters = [];
        this.galleryIcons = [];
        this.victoryAchieved = false;
        this.prevActiveFaces = new Set();

        this.add.text(400, 18, 'FACE CLICKER', {
            fontSize: '26px', fontFamily: 'Arial Black, Arial',
            color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 48, 'Click a character to cycle faces. Display all 9 expressions to win!', {
            fontSize: '13px', fontFamily: 'Arial', color: '#7f8c8d'
        }).setOrigin(0.5);

        this.clickText = this.add.text(770, 18, 'Clicks: 0', {
            fontSize: '15px', fontFamily: 'Arial', color: '#2c3e50'
        }).setOrigin(1, 0);

        this.createGallery();
        this.createCharacterGrid();
        this.createShuffleButton();

        this.add.text(400, 505, 'Each click cycles through: smile, frown, grimace, and more!', {
            fontSize: '12px', fontFamily: 'Arial', color: '#95a5a6'
        }).setOrigin(0.5);

        this.updateGallery();
        this.prevActiveFaces = this.getActiveFaces();
    }

    createGallery() {
        this.add.text(400, 73, 'FACE GALLERY', {
            fontSize: '10px', fontFamily: 'Arial', color: '#bdc3c7'
        }).setOrigin(0.5);

        const spacing = 42;
        const startX = 400 - (this.faceKeys.length * spacing) / 2 + spacing / 2;

        for (let i = 0; i < this.faceKeys.length; i++) {
            const x = startX + i * spacing;
            const bg = this.add.rectangle(x, 93, 34, 26, 0xecf0f1).setStrokeStyle(1, 0xbdc3c7);
            const icon = this.add.image(x, 93, this.faceKeys[i]).setScale(0.4).setAlpha(0.25);
            this.galleryIcons.push({ bg, icon });
        }
    }

    createCharacterGrid() {
        const cols = 3;
        const positions = [];
        const xCenter = [160, 400, 640];
        const yCenter = [175, 305, 435];

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                positions.push({ x: xCenter[c], y: yCenter[r] });
            }
        }

        for (let i = 0; i < this.bodyKeys.length; i++) {
            const pos = positions[i];
            const randomFace = Phaser.Math.Between(0, this.faceKeys.length - 1);

            const shadow = this.add.ellipse(pos.x + 3, pos.y + 3, 78, 78, 0xd5d8dc, 0.5);
            const body = this.add.image(pos.x, pos.y, this.bodyKeys[i]).setInteractive();
            const face = this.add.image(pos.x, pos.y, this.faceKeys[randomFace]).setInteractive();

            const charGroup = [shadow, body, face];

            body.on('pointerover', () => {
                if (!this.victoryAchieved) {
                    this.tweens.add({ targets: charGroup, scaleX: 1.12, scaleY: 1.12, duration: 100 });
                }
            });
            body.on('pointerout', () => {
                this.tweens.add({ targets: charGroup, scaleX: 1, scaleY: 1, duration: 100 });
            });
            face.on('pointerover', () => {
                if (!this.victoryAchieved) {
                    this.tweens.add({ targets: charGroup, scaleX: 1.12, scaleY: 1.12, duration: 100 });
                }
            });
            face.on('pointerout', () => {
                this.tweens.add({ targets: charGroup, scaleX: 1, scaleY: 1, duration: 100 });
            });

            body.on('pointerdown', () => this.cycleFace(i));
            face.on('pointerdown', () => this.cycleFace(i));

            this.characters.push({ shadow, body, face, faceIndex: randomFace, group: charGroup });
        }
    }

    cycleFace(index) {
        if (this.victoryAchieved) return;

        const char = this.characters[index];
        char.faceIndex = (char.faceIndex + 1) % this.faceKeys.length;
        char.face.setTexture(this.faceKeys[char.faceIndex]);

        this.tweens.add({
            targets: char.group,
            scaleX: 1.25, scaleY: 1.25,
            duration: 80, yoyo: true, ease: 'Quad.easeOut'
        });

        this.clickCount++;
        this.clickText.setText('Clicks: ' + this.clickCount);

        this.updateGallery();
        this.checkVictory();
    }

    getActiveFaces() {
        return new Set(this.characters.map(c => c.faceIndex));
    }

    updateGallery() {
        const active = this.getActiveFaces();

        for (let i = 0; i < this.faceKeys.length; i++) {
            const entry = this.galleryIcons[i];
            if (active.has(i)) {
                entry.icon.setAlpha(1.0);
                entry.bg.setFillStyle(0xffffff).setStrokeStyle(2, 0x27ae60);
                if (!this.prevActiveFaces.has(i)) {
                    this.tweens.add({
                        targets: entry.icon,
                        scaleX: 0.7, scaleY: 0.7,
                        duration: 150, yoyo: true, ease: 'Back.easeOut'
                    });
                }
            } else {
                entry.icon.setAlpha(0.25);
                entry.bg.setFillStyle(0xecf0f1).setStrokeStyle(1, 0xbdc3c7);
            }
        }

        this.prevActiveFaces = active;
    }

    checkVictory() {
        const active = this.getActiveFaces();
        if (active.size === this.faceKeys.length && !this.victoryAchieved) {
            this.victoryAchieved = true;
            this.showVictory();
        }
    }

    showVictory() {
        this.spawnConfetti();

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            this.tweens.add({
                targets: char.group,
                scaleX: 1.4, scaleY: 1.4,
                duration: 300, yoyo: true,
                delay: i * 120, ease: 'Back.easeOut'
            });
        }

        const victoryText = this.add.text(400, 530,
            'ALL 9 FACES COLLECTED in ' + this.clickCount + ' clicks!', {
            fontSize: '22px', fontFamily: 'Arial Black, Arial',
            color: '#e74c3c', fontStyle: 'bold',
            backgroundColor: '#ffffff', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1, duration: 400, delay: 600,
            ease: 'Quad.easeInOut'
        });

        const playAgain = this.add.text(400, 565, 'Click here to play again!', {
            fontSize: '14px', fontFamily: 'Arial',
            color: '#2980b9', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: playAgain,
            alpha: 1, duration: 400, delay: 1200
        });

        playAgain.on('pointerover', () => playAgain.setStyle({ color: '#3498db' }));
        playAgain.on('pointerout', () => playAgain.setStyle({ color: '#2980b9' }));
        playAgain.on('pointerdown', () => this.scene.restart());
    }

    spawnConfetti() {
        const colors = [0xe74c3c, 0xf39c12, 0x2ecc71, 0x3498db, 0x9b59b6, 0x1abc9c];
        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(-50, 0);
            const color = Phaser.Math.RND.pick(colors);
            const w = Phaser.Math.Between(4, 10);
            const h = Phaser.Math.Between(4, 10);

            const piece = this.add.rectangle(x, y, w, h, color);

            this.tweens.add({
                targets: piece,
                y: Phaser.Math.Between(100, 550),
                x: x + Phaser.Math.Between(-80, 80),
                angle: Phaser.Math.Between(0, 360),
                alpha: 0,
                duration: Phaser.Math.Between(1500, 3000),
                delay: Phaser.Math.Between(0, 800),
                ease: 'Cubic.easeOut',
                onComplete: () => piece.destroy()
            });
        }
    }

    createShuffleButton() {
        const btn = this.add.text(30, 18, 'Shuffle', {
            fontSize: '15px', fontFamily: 'Arial',
            color: '#2980b9', fontStyle: 'bold',
            backgroundColor: '#ecf0f1', padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ color: '#3498db', backgroundColor: '#dfe6e9' }));
        btn.on('pointerout', () => btn.setStyle({ color: '#2980b9', backgroundColor: '#ecf0f1' }));
        btn.on('pointerdown', () => this.shuffleFaces());
    }

    shuffleFaces() {
        if (this.victoryAchieved) return;

        for (const char of this.characters) {
            char.faceIndex = Phaser.Math.Between(0, this.faceKeys.length - 1);
            char.face.setTexture(this.faceKeys[char.faceIndex]);

            this.tweens.add({
                targets: char.group,
                scaleX: 0.8, scaleY: 0.8,
                duration: 100, yoyo: true, ease: 'Quad.easeInOut'
            });
        }

        this.clickCount++;
        this.clickText.setText('Clicks: ' + this.clickCount);
        this.updateGallery();
        this.checkVictory();
    }
}