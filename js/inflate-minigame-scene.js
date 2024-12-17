class InflateMinigameScene extends Phaser.Scene {
    constructor() {
        super("InflateMinigameScene")

        this.osoElegido
        this.flotadorSprite
        this.osoSprite

        this.estado

        this.textoTiempo
        this.tiempoDisponible

        this.vecesDesinflado
        this.aireActual
        this.aireNecesario

        this.popups = {}
        this.pointer
        this.x0
        this.escenaTerminada

        this.botonAudio
        this.botonAudioOff
    }

    init(d) {
        this.osoElegido = d.oso.label
        this.estadoOso = 'normal'
        this.aireActual = 0
        this.aireNecesario = 0
        this.tiempoDisponible = 0
        this.vecesDesinflado = d.vecesDesinflado
        this.escenaTerminada = false
    }

    preload() {
        
    }

    create() {
        this.aireNecesario = DATA.balance.inflateMinigame.AirNeed + this.vecesDesinflado * DATA.balance.inflateMinigame.AirNeedIncrement
        this.tiempoDisponible = DATA.balance.inflateMinigame.AvailableTime*1000 + this.vecesDesinflado * DATA.balance.inflateMinigame.AvailableTimeIncrement*1000
        this.tiempoDisponible = Math.floor(this.tiempoDisponible)
        var airePerdidoPorStack = DATA.balance.inflateMinigame.AirLostPerTime + this.vecesDesinflado * DATA.balance.inflateMinigame.AirLostPerTimeIncrement
        var duracionStack = DATA.balance.inflateMinigame.AirLostInterval*1000 + this.vecesDesinflado * DATA.balance.inflateMinigame.AirLostIntervalIncrement*1000

        var barX = gWIDTH*0.7 +113
        var barY = gHEIGHT*0.65 + 25
        this.x0 = barY-150
        this.add.rectangle(0,0,gWIDTH*2, gHEIGHT*2, 0x000000, 0.7)
        
        // popup normal
        this.popups.normal = {
            back: this.add.image(gWIDTH/2, gHEIGHT/2, 'InflateMinigameNormalPopup')
        }
        this.pointer = this.add.image(barX+20, this.x0, 'InflateMinigamePointer')
        this.add.sprite(barX-22, barY -500 -5, this.osoElegido+'-inflador', 8).setScale(0.23)
        this.add.sprite(barX-24, barY -150, this.osoElegido+'-inflador', 0).setScale(0.26)
        
        this.textoTiempo = this.add.text(gWIDTH/2, 565, 
            (Math.round(this.tiempoDisponible/1000 * 100) / 100).toFixed(2), 
            {
                fontFamily: 'sunn',
                align: "center",
                fontSize: 100,
                color: '#000'
            })
        this.textoTiempo.setOrigin(0.5)

        // popups perder y ganar
        this.popups.perder = {
            back: this.add.image(gWIDTH*0.5, gHEIGHT*0.5, 'InflateMinigameLostPopup'),
            boton: this.add.image(gWIDTH*0.8, gHEIGHT*0.75, 'InflateMinigameRestart')
        }
        this.popups.ganar = {
            back: this.add.image(gWIDTH*0.5, gHEIGHT*0.5, 'InflateMinigameWonPopup'),
            boton: this.add.image(gWIDTH*0.8, gHEIGHT*0.75, "InflateMinigamePlay"),
        }
        Object.values(this.popups.ganar).forEach(x => {x.visible = false})
        Object.values(this.popups.perder).forEach(x => {x.visible = false})

        // sprite oso
        this.flotadorSprite = this.add.sprite(gWIDTH/2, gHEIGHT/2, this.osoElegido+'-inflador', 0)
        this.osoSprite = this.add.sprite(gWIDTH/2, gHEIGHT/2, this.osoElegido+'-inflando', 0)
        
        // flow
        this.input.on('pointerdown', ()=> {
            if (!this.escenaTerminada) {
                this.aireActual += DATA.balance.inflateMinigame.AirPerClick
            }
        })  
        this.input.keyboard.on("keydown-SPACE", (key)=> {
            if (!this.escenaTerminada) {
                this.aireActual += DATA.balance.inflateMinigame.AirPerClick
            }
        })
        this.input.keyboard.on("keydown-ENTER", (key)=> {
            if (this.escenaTerminada) {
                game.scene.stop("InflateMinigameScene")
                game.scene.resume("GameScene")
            }
        })
        function desinflar(airePerdido, ratioPerdida, escena) {
            escena.time.delayedCall(ratioPerdida, ()=> {
                // para no seguir restando aire
                if (escena.aireActual>escena.aireNecesario) return
                
                escena.aireActual -= airePerdido
                if (escena.aireActual < 0) escena.aireActual = 0
                
                desinflar(airePerdido, ratioPerdida, escena)
            }, escena)
        }
        desinflar(airePerdidoPorStack, duracionStack, this)

        // UI
        var botonPausa = this.add.image(gWIDTH - 65, 55, 'botonPausa')
        var botonAudio = this.add.image(gWIDTH - 35 - botonPausa.width, 55, 'botonAudio')
        var botonAudioOff = this.add.image(gWIDTH - 35 - botonPausa.width, 55, 'botonAudioOff')

        DATA.animarBoton(botonPausa)
        DATA.animarBoton(botonAudio)
        DATA.animarBoton(botonAudioOff)

        DATA.animarBoton(this.popups.ganar.boton)
        DATA.animarBoton(this.popups.perder.boton)
        
        botonPausa.on('pointerup', () => {
            this.scene.pause()
            game.scene.start('OptionsScene', {parentScene: "InflateMinigameScene"})
        })
        botonAudio.on('pointerup', () => {
            trackEvent("game", "audio:on")
            DATA.switchAudio()
        })
        botonAudioOff.on('pointerup', (pointer) => {
            trackEvent("game", "audio:off")
            DATA.switchAudio()
        })

        this.popups.ganar.boton.on('pointerup', () => {
            game.scene.stop("InflateMinigameScene")
            game.scene.resume("GameScene")
        })
        this.popups.perder.boton.on('pointerup', ()=> {
            game.scene.stop("GameScene")
            game.scene.remove("GameScene")
            game.scene.add("GameScene", GameScene)
            game.scene.start('GameScene', {level: DATA.currentLevel})
        })

        this.botonAudio = botonAudio
        this.botonAudioOff = botonAudioOff
    }


    
    
    update(time,delta) {
        this.botonAudioOff.alpha = 1 -(DATA.soundActive || DATA.musicActive)
        this.botonAudio.alpha = (DATA.soundActive || DATA.musicActive)
        var porcentaje = this.aireActual / this.aireNecesario

        if (!this.escenaTerminada) {
            this.tiempoDisponible -= delta

            if (this.tiempoDisponible <= 0) { // si se acaba el tiempo
                Object.values(this.popups.perder).forEach(x => {x.visible = true})
    
                this.osoSprite.play(this.osoElegido+'-inflando-perder', true)

                this.escenaTerminada = true
            }
            else { // si todavia hay tiempo
                this.textoTiempo.setText((Math.round(this.tiempoDisponible/1000 * 100) / 100).toFixed(2))
    
                if (this.aireActual > this.aireNecesario) {
                    Object.values(this.popups.ganar).forEach(x => {x.visible = true})
    
                    this.osoSprite.play(this.osoElegido+'-inflando-fin', true)

                    this.escenaTerminada = true
                }
                else if (this.aireActual <= 0) {
                    this.osoSprite.play(this.osoElegido+'-inflando-stand', true)
                }
                else {
                    this.osoSprite.play(this.osoElegido+'-inflando-normal', true)
                }
            }

            this.pointer.y = this.x0 - 303 * porcentaje
        }        

        var animInflador = 0
        if (porcentaje == 0) {
            animInflador = 0
        }
        else if (porcentaje <= 0.25) {
            animInflador = 1
        }
        else if (porcentaje <= 0.5) {
            animInflador = 2
        }
        else if (porcentaje <=0.75) {
            animInflador = 3
        }
        else if (porcentaje < 1) {
            animInflador = 4
        }
        else {
            animInflador = 5
        }
        this.flotadorSprite.play(this.osoElegido+'-inflador-'+animInflador, true)
    }
}