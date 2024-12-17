class LevelSelectionScene extends Phaser.Scene {
    constructor ()
    {
        super('LevelSelectionScene');

        this.levelProgressData
    }
    preload() {
        

    }
    create() {
        this.levelProgressData = DATA.getGameProgress()
        var lock = 'lockedLevelButton'
        var unlock = 'unlockedLevelButton'

        this.add.image(gWIDTH/2, gHEIGHT/2, 'levelSelectionBg')
        this.add.image(gWIDTH/2, gHEIGHT*0.4, 'levelSelectionPopup')

        var thisScene = this

        for (var j=0; j<4; j++) { // horizontal
            for (var i=-2; i<=2; i++) { // vertical
                var n = i + 3 + j*5
                var pos = {
                    x: gWIDTH/2 + 130*i,
                    y: gHEIGHT*0.21 + 183*j
                }
                var Aij = DATA.progress[n-1]
                

                var botonActual = thisScene.add.image(pos.x, pos.y, Aij.unlocked ? unlock : lock)
                
                var textoActual = thisScene.add.text(
                    pos.x - 15 + (n < 10 ? 7 : 0), 
                    pos.y - 30, 
                    n.toString(), 
                    {
                        fontFamily: 'trash-hand',
                        fontStyle: 'bold',
                        align: "center",
                        fontSize: 60,
                        color: '#fff'
                    })
                textoActual.setShadow(3, 3, 'rgba(0, 0, 0, 0.5)', 1)
                
                if (Aij.unlocked) { // if unlock
                    animarBotonYTexto(botonActual, textoActual, n)        
                    thisScene.add.image(pos.x, pos.y + 62, 'levelStar' + Aij.stars)
                }
                else { // if lock
                    thisScene.add.image(pos.x + 40, pos.y + 52, 'levelSelectionLock')
                }
                
            }
        }

        var botonAudio = this.add.image(gWIDTH - 35 -50, 55, 'botonAudio')
        var botonAudioOff = this.add.image(gWIDTH - 35 -50, 55, 'botonAudioOff')
        DATA.animarBoton(botonAudio)
        DATA.animarBoton(botonAudioOff)
        
        botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
        botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)

        botonAudio.on('pointerup', (pointer) => {
            trackEvent("game", "audio:on")
            DATA.switchAudio()
            botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
            botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)
        })
        botonAudioOff.on('pointerup', (pointer) => {
            trackEvent("game", "audio:off")
            DATA.switchAudio()
            botonAudio.alpha  = (DATA.soundActive || DATA.musicActive)
            botonAudioOff.alpha = 1- (DATA.soundActive || DATA.musicActive)
        })

        function animarBotonYTexto(boton, texto, nivel) {
            boton.setInteractive()
            boton.on('pointerover', ()=> {
                TweenMax.to(boton, DATA.t*1.2, {scale:1.2, ease: Back.easeOut.config(3)})
                TweenMax.to(texto, DATA.t*1.2, {scale:1.2, ease: Back.easeOut.config(3)})
            })
            boton.on('pointerout', ()=> {
                TweenMax.to(boton, DATA.t/3, {scale:1, ease: Back.easeOut.config(3)})
                TweenMax.to(texto, DATA.t/3, {scale:1, ease: Back.easeOut.config(3)})
            })
            4+4
            boton.on('pointerup', ()=> {
                trackEvent("game", "level:"+nivel+":preview")
                game.scene.start("TrackPreviewScene", {level: nivel})
            })
        }
    }
    update () {
    }
}