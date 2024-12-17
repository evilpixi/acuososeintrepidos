class OptionsScene extends Phaser.Scene {
    constructor ()
    {
        super('OptionsScene');

        this.parentScene
    }
    init (data) {
        game.scene.bringToTop("OptionsScene")
        this.parentScene = data.parentScene
    }
    preload() {       
        
    }
    create() {
        var thisScene = this
        var desfaseX = 200
        var desfaseY = 85
        var backBlack = this.add.graphics()
        backBlack.fillStyle(0x000000, 0.5)
        backBlack.fillRect(0, 0, gWIDTH, gHEIGHT)

        this.add.image(gWIDTH/2, gHEIGHT*0.4, 'panelOpciones')

        var botones = {
            home:   this.add.image(gWIDTH/2 - desfaseX, gHEIGHT*0.4 - desfaseY, 'botonHome'),
            musica: this.add.image(gWIDTH/2,            gHEIGHT*0.4 - desfaseY, 'botonMusica'),
            musicaO:this.add.image(gWIDTH/2,            gHEIGHT*0.4 - desfaseY, 'botonMusicaOff'),
            sonido: this.add.image(gWIDTH/2 + desfaseX, gHEIGHT*0.4 - desfaseY, 'botonSonido'),
            sonidoO:this.add.image(gWIDTH/2 + desfaseX, gHEIGHT*0.4 - desfaseY, 'botonSonidoOff'),
            help:   this.add.image(gWIDTH/2 - desfaseX, gHEIGHT*0.4 + desfaseY, 'botonHelp'),
            logros: this.add.image(gWIDTH/2,            gHEIGHT*0.4 + desfaseY, 'botonLogros'),
            restart:this.add.image(gWIDTH/2 + desfaseX, gHEIGHT*0.4 + desfaseY, 'botonRestart'),
            play:   this.add.image(gWIDTH/2 + desfaseX - 20, gHEIGHT*0.4 + desfaseY*3, 'botonPlay'),
        }
        Object.values(botones).forEach(b => {
            DATA.animarBoton(b)
        });
        botones.musica.alpha  = DATA.musicActive
        botones.musicaO.alpha = 1- DATA.musicActive
        botones.sonido.alpha  = DATA.soundActive
        botones.sonidoO.alpha = 1- DATA.soundActive


        botones.logros.on('pointerup', ()=> {
            trackEvent("game", "archievement")
            game.scene.start('ArchievementsScene', {parentScene: "OptionsScene"})
            game.scene.bringToTop('ArchievementsScene')
            game.scene.pause("OptionScene")
        })
        botones.sonido.on('pointerup', ()=> { 
            trackEvent("game", "sfx")
            DATA.switchSound()
            botones.sonido.alpha  = DATA.soundActive
            botones.sonidoO.alpha = 1- DATA.soundActive
        })
        botones.sonidoO.on('pointerup', ()=> { 
            trackEvent("game", "sfx")
            DATA.switchSound()
            botones.sonido.alpha  = DATA.soundActive
            botones.sonidoO.alpha = 1- DATA.soundActive
        })
        botones.musica.on('pointerup', ()=> { 
            trackEvent("game", "melody")
            DATA.switchMusic()
            botones.musica.alpha  = DATA.musicActive
            botones.musicaO.alpha = 1- DATA.musicActive
        })
        botones.musicaO.on('pointerup', ()=> { 
            trackEvent("game", "melody")
            DATA.switchMusic()
            botones.musica.alpha  = DATA.musicActive
            botones.musicaO.alpha = 1- DATA.musicActive
        })
        botones.restart.on('pointerup', ()=> { 
            if (this.parentScene == "InflateMinigameScene") {
                game.scene.stop("InflateMinigameScene")
                this.parentScene = "GameScene"
            }
            if (this.parentScene == "GameScene") {
                
                trackEvent("game", "level:"+DATA.currentLevel+":reset")
                game.scene.stop("GameScene")
                game.scene.remove("GameScene")
                game.scene.add("GameScene", GameScene)
                game.scene.start('GameScene', {level: DATA.currentLevel})
                game.scene.stop("OptionsScene")
            }
        })
        botones.play.on('pointerup', ()=> { 
            if (this.parentScene == "InflateMinigameScene") {
                game.scene.resume("InflateMinigameScene")
                this.scene.stop()
            }
            if (this.parentScene == "GameScene") {
                game.scene.resume("GameScene")
                this.scene.stop()
            }
            trackEvent("game", "button.play")
        })
        botones.home.on('pointerup', ()=> {
            if (this.parentScene == "GameScene") {
                
                trackEvent("game", "level:"+DATA.currentLevel+":quit")
                game.scene.stop("GameScene")
                game.scene.remove("GameScene")
            }                        
            game.scene.start("SplashScene")
            game.scene.stop("OptionsScene")
        })
        botones.help.on('pointerup', ()=> {     
            trackEvent("game", "help:enter")
            game.scene.start("HelpScene", "OptionsScene")
            game.scene.bringToTop("HelpScene")
            game.scene.pause("OptionsScene")
        })
    }
    update () {
    }
}