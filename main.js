// Cena de boas-vindas
class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
    }

    preload() {
        // Carrega a imagem de fundo
        this.load.image('inicio', 'assets/inicial.png');
       
    }

    create() {
        // Adiciona fundo e textos na tela inicial
        this.add.image(512, 256, 'inicio');

        // Aguarda a tecla espaço para iniciar o jogo
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

// Cena principal do jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Carrega as imagens utilizadas no jogo
        this.load.image('bg', 'assets/Bg.png');
        this.load.image('heroi', 'assets/heroi.png'); // Personagem parado
        this.load.image('aranha', 'assets/aranha.png'); // Inimigo
        this.load.image('fogo', 'assets/fogo.png'); // Tiro
    }

    create() {
        // Adiciona o fundo do jogo
        this.add.image(512, 256, 'bg');
        
        // Cria o jogador e ajusta a escala
        this.player = this.physics.add.sprite(100, 450, 'heroi')
            .setCollideWorldBounds(true) // Mantém dentro dos limites da tela
            .setScale(0.3); // Reduz o tamanho
        
        // Criando teclas de controle
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Grupos de balas e inimigos
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();

        // Timer para gerar inimigos periodicamente
        this.time.addEvent({
            delay: 1500, // A cada 1.5 segundos
            callback: this.spawnaranha,
            callbackScope: this,
            loop: true
        });

        // Detecta colisão entre balas e inimigos
        this.physics.add.overlap(this.bullets, this.enemies, this.hitaranha, null, this);
        
        // Detecta colisão entre jogador e inimigos
        this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

        // Variável de pontuação e exibição
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Pontos: 0', { 
            fontSize: '24px', 
            fontFamily: 'Comic Sans MS',
            fill: '#000' 
        });
    }

    update() {
        // Movimentação do jogador
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300); // Move o herói para esquerda
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300); // Move o herói para direita
        } else {
            this.player.setVelocityX(0); // Para quando nenhuma tecla é pressionada
        }

        // Atira ao pressionar espaço
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.shootBullet();
        }
    }

    // Dispara um tiro
    shootBullet() {
        let bullet = this.bullets.create(this.player.x, this.player.y - 20, 'fogo')
            .setScale(0.6) // Define o tamanho
            .setVelocityY(-300); // Velocidade para cima
    }

    // Gera um inimigo
    spawnaranha() {
        let aranha = this.enemies.create(Phaser.Math.Between(50, 974), 50, 'aranha')
            .setScale(0.3) // Define tamanho
            .setVelocityY(100); // Faz o inimigo descer
        
        // Adiciona colisão com os limites da tela
        aranha.setCollideWorldBounds(true);
        aranha.body.onWorldBounds = true;

        // Se o inimigo atingir o fim da tela, game over
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === aranha) {
                this.gameOver();
            }
        });
    }

    // Quando o inimigo é atingido
    hitaranha(bullet, aranha) {
        bullet.destroy(); // Remove a bala
        aranha.destroy(); // Remove o inimigo

        this.score += 10; // Aumenta a pontuação
        this.scoreText.setText('Pontos: ' + this.score);

        // Se atingir 50 pontos, muda para a tela de Game Over
        if (this.score >= 100) {  
            this.scene.start('GameOverScene', { score: this.score });
        }
    }

    // Finaliza o jogo
    gameOver() {
        this.scene.start('GameOverScene', { score: this.score, message: 'Game Over! A aranha te derrotou, reinicie o jogo' });
    }
}

//Cena de Game Over
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.message = data.message || 'VOCÊ VENCEU!';
    }

    create() {
        // Exibe mensagem de game over e pontuação final
        //this.add.text(512, 200, this.message, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(512, 200, this.message, { 
            fontSize: '32px', 
            fontFamily: 'Comic Sans MS', // Nome da fonte
            fill: '#ff0000' 
        }).setOrigin(0.5);
        this.add.text(512, 250, `Pontos: ${this.finalScore}`, { 
            fontSize: '24px', 
            fontFamily: 'Comic Sans MS',
            fill: '#fff' 
        }).setOrigin(0.5);
        this.add.text(512, 300, 'Pressione R para reiniciar', { 
            fontSize: '24px', 
            fontFamily: 'Comic Sans MS',
            fill: '#fff' 
        }).setOrigin(0.5);

        // Aguarda tecla R para reiniciar o jogo
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('GameScene');
        });
    }
}

// Configuração do Phaser
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 512,
    scene: [WelcomeScene, GameScene, GameOverScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // Desativa o modo de depuração para remover a visualização das hitboxes
        }
    }
};

// Inicia o jogo
const game = new Phaser.Game(config);