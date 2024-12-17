class SplashScene extends Phaser.Scene {
    constructor ()
    {
        super('SplashScene');

        this.bg
        /*this.polar
        this.pardo
        this.panda*/
        this.osos
        this.salpicones
        this.logo

        this.preloadStuff = []

        this.animCount = 0
        this.t = DATA.t // duracion de los tween de los botones
    }
    preload() {
    }
    create() {
        var thisScene = this
        if (!DATA.isLogged) {
            game.scene.start("GotItScene")
        }
        DATA.stopMusic()
        //DATA.music.mainMusic.play({ loop: true})
        DATA.playMusic('mainMusic')
        this.bg = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height/2, 'splash-bg')//'splashBg')
        var polar = this.add.sprite(500, 630, 'polar-splash', 0)
        var pardo = this.add.sprite(220, 770, 'pardo-splash', 0)
        var panda = this.add.sprite(350, 890, 'panda-splash', 3)        
        var salpicon = this.add.image(650,1100, 'splash-water')
        var osos = [polar, pardo, panda]
        var animsFinalizadas = []
        osos.forEach(o => o.alpha= 0)

        // alpha
        this.tweens.add({
            targets: osos,
            alpha: 1,
            duration: DATA.t*1100,
        })
        
        // movimiento
        this.tweens.add({
            targets: polar,
            x: polar.x -220,
            y: polar.y +70,
            duration: DATA.t*1300,
            ease: 'Power2',
            onComplete: ()=> {
                animsFinalizadas.push('polar')
                runLastTween()
                polar.anims.play('polar-splash-anim', true)
            }
        })
        this.tweens.add({
            targets: pardo,
            x: pardo.x +35,
            y: pardo.y +220,
            duration: DATA.t*1300,
            ease: 'Power2',
            onComplete: ()=> {
                animsFinalizadas.push('pardo')
                runLastTween()
                pardo.anims.play('pardo-splash-anim', true)
            }
        })
        this.tweens.add({
            targets: panda,
            x: panda.x +220,
            y: panda.y -40,
            duration: DATA.t*1300,
            ease: 'Power2',
            onComplete: ()=> {
                animsFinalizadas.push('panda')
                runLastTween()
                panda.anims.play('panda-splash-anim', true)
            }
        })

        // after 3 moved, do sine
        function runLastTween() {
            if (animsFinalizadas.length != 3) return
            osos.forEach((oso, i) => {
                thisScene.tweens.add({
                    targets: oso,
                    y: oso.y + 24 +(i)*15,
                    duration: 2000,
                    delay: i*300,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                })
            })
        }
        /*this.polar = this.physics.add.image(340, 710,'polarSplash')
        this.pardo = this.physics.add.image(210, 970,'pardoSplash')
        this.panda = this.physics.add.image(650,  890,'pandaSplash')*/
        //this.osos = this.add.image(gWIDTH/2, gHEIGHT/2 + 50, 'osos')

        //this.add.image(this.sys.canvas.width/2, 680,'salpicones')
        //this.salpicones = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height-380,'granSalpicon')

        this.logo = this.add.image(this.sys.canvas.width/2+10, 300,'logo')
        //this.logo.alpha = 0
        //TweenMax.from(this.logo, this.t*1.1, {alpha: 0, ease: Expo.easeIn})
        TweenMax.from(this.logo, this.t*3, {
            scale: 1,
            ease: Elastic.easeOut.config(1, 0.3),
            y: -500
        })
        


        

        var botonJugar = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height*0.76 -70,'botonJugar')
        botonJugar.setInteractive()
        botonJugar.on('pointerup', function (pointer) {
            trackEvent("game", "play")
            this.scene.scene.stop()
            game.scene.start("LevelSelectionScene")
        })        
        botonJugar.setScale(0)
        TweenMax.to(botonJugar, this.t, {scale:1, delay: this.t, ease: Back.easeOut.config(3)})
        

        var botonAyuda = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height*0.84 -70,'botonAyuda')
        botonAyuda.setInteractive()
        botonAyuda.on('pointerup', function (pointer) {
            trackEvent("game", "help:enter")
            game.scene.pause("SplashScene")     
            game.scene.start("HelpScene", "SplashScene")
        })
        botonAyuda.setScale(0)
        TweenMax.to(botonAyuda, this.t, {scale:1, delay: this.t*1.8, ease: Back.easeOut.config(3)})


        var botonAudio = this.add.image(this.sys.canvas.width - 70, 70,'botonAudio')
        var botonAudioOff = this.add.image(this.sys.canvas.width - 70, 70,'botonAudioOff')
        botonAudio.setInteractive()
        botonAudioOff.setInteractive()

        botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
        botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)

        botonAudio.on('pointerup', function (pointer) {
            DATA.switchAudio()
            botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
            botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)
        })
        botonAudioOff.on('pointerup', function (pointer) {
            DATA.switchAudio()
            botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
            botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)
        })
        botonAudio.setScale(0)
        botonAudioOff.setScale(0)
        TweenMax.to(botonAudio, this.t, {scale:1, delay: this.t*1.8, ease: Back.easeOut.config(3)})
        TweenMax.to(botonAudioOff, this.t, {scale:1, delay: this.t*1.8, ease: Back.easeOut.config(3)})

        var botones = [
            botonAyuda,
            //botonEntendido,
            botonJugar,
            botonAudio,
            botonAudioOff
        ]
        botones.forEach((boton) => {
            DATA.animarBoton(boton)
        })
    }
    update () {
    }
}