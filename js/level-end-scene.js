class LevelEndScene extends Phaser.Scene {
    constructor ()
    {
        super("LevelEndScene");

        this.data = {}
        this.currentLevel
        this.nextLevel
        this.gameFinished = false
    }
    init(d) {
        this.data = d
        console.log(d)
    }
    preload() {
        this.currentLevel = DATA.currentLevel
        this.nextLevel = DATA.currentLevel+1
        // set data to local storage
        if (localStorage.getItem('level_' + this.currentLevel + '_stars') <= this.data.stars) {
            localStorage.setItem('level_' + this.currentLevel + '_stars', this.data.stars)
        }
        
        if (DATA.cuentaAtras) {
            if (localStorage.getItem('level_' + this.currentLevel + '_best_time') < this.data.tiempo) {
                localStorage.setItem('level_' + this.currentLevel + '_best_time', this.data.tiempo)
            }
        } 
        else {
            if (localStorage.getItem('level_' + this.currentLevel + '_best_time') > this.data.tiempo) {
                localStorage.setItem('level_' + this.currentLevel + '_best_time', this.data.tiempo)
            }
        }
        
        if (this.data.ganaste) {
            // unlock next
            if (this.currentLevel != 20) {
                if (localStorage.getItem('level_' + (this.nextLevel) + '_unlocked', false)) {
                    localStorage.setItem('level_' + (this.nextLevel) + '_unlocked', true)
                }
                DATA.currentLevel++
            }
            else { // end game
                this.gameFinished = true
            }            
            DATA.progress = DATA.getGameProgress()
        }
    }
    create() {
        // get score
        var thisScene = this

        this.add.rectangle(0, 0, gWIDTH*2, gHEIGHT*2, 0x000000, 0.5)
        DATA.stopMusic()
        if (this.data.ganaste) {
            DATA.sounds.youWon.play()
        }
        else {
            DATA.sounds.youLost.play()
        }

        var oso
        if (this.data.ganaste) {
            this.add.image(gWIDTH/2, gHEIGHT/2, 'levelEndPopupWin')
            oso = this.add.image(gWIDTH/2, 1400, 'levelEndGrizz')
        }
        else {
            this.add.image(gWIDTH/2, gHEIGHT/2, 'levelEndPopupLost')
            oso = this.add.image(gWIDTH/2, 1400, 'levelEndPanda')
        }
        TweenMax.to(oso, DATA.t*2, {
            y: gHEIGHT-200,
            ease: Elastic.easeOut.config(1, 0.6)
        })

        if (this.data.ganaste) trackEvent("game", "level:"+this.currentLevel+":winner")
        //var nivelCorrido = this.data.ganaste? DATA.currentLevel-1 : DATA.currentLevel
        var textoLvl = this.add.text(gWIDTH/2, 590, 
            "NIVEL "+ this.currentLevel, {
                fontFamily: 'trash-hand',
                align: "center",
                fontSize: 100,
                color: '#4DBCC5'
            })
        textoLvl.setOrigin(0.5)

        var fruitTextStyle = {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 46,
            color: '#FFFFFF',
            stroke: '000000',
            strokeThickness: 6
        }
        var fruitNames = DATA.levelData['level'+this.currentLevel].fruits

        var fruits = [
            this.add.image(gWIDTH/2 -200, 700, 'level-end-'+fruitNames[0]).setScale(1.12),
            this.add.image(gWIDTH/2,      700, 'level-end-'+fruitNames[1]).setScale(1.12),
            this.add.image(gWIDTH/2 +200, 700, 'level-end-'+fruitNames[2]).setScale(1.12)
        ]
        var textFruits = [
            this.add.text(fruits[0].x, fruits[0].y +51, "x" + (0 + this.data.frutas[fruitNames[0]]), fruitTextStyle).setOrigin(0.5),
            this.add.text(fruits[1].x, fruits[1].y +51, "x" + (0 + this.data.frutas[fruitNames[1]]), fruitTextStyle).setOrigin(0.5),
            this.add.text(fruits[2].x, fruits[2].y +51, "x" + (0 + this.data.frutas[fruitNames[2]]), fruitTextStyle).setOrigin(0.5)
        ]

        var fruitsCollected = Number(localStorage.getItem('level_'+thisScene.currentLevel+'_fruits_collected'))
        var newFruitsCollected = Object.values(this.data.frutas).reduce((x,y)=> x+y)
        if (fruitsCollected < newFruitsCollected) {
            localStorage.setItem('level_'+thisScene.currentLevel+'_fruits_collected', newFruitsCollected)
        }

        var leftStar =  this.add.image(gWIDTH/2 -182, 480-16, this.data.stars > 0 ? 'levelEndStarLeftOn' : 'levelEndStarLeftOff')
        var rightStar = this.add.image(gWIDTH/2 +182, 480-16, this.data.stars > 2 ? 'levelEndStarRightOn' : 'levelEndStarRightOff')
        var midStar =   this.add.image(gWIDTH/2,      430-16, this.data.stars > 1 ? 'levelEndStarMidOn' : 'levelEndStarMidOff')

        TweenMax.from(leftStar, DATA.t*0.6, { scale:0, delay: 0, ease: Back.easeOut.config(7)})
        TweenMax.from(rightStar, DATA.t*0.6, { scale:0, delay: DATA.t*0.3, ease: Back.easeOut.config(7)})
        TweenMax.from(midStar, DATA.t*0.9, { scale:0, delay: DATA.t*0.6, ease: Back.easeOut.config(10)})

        
        var btnPlay = this.add.image(gWIDTH/2 + 310, 1330, 'levelEndPlayButton')
        var btnHome = this.add.image(gWIDTH/2 - 273, 1295, 'levelEndHomeButton')

        //puntaje
        var textoPuntajeEstilo = {
            fontFamily: 'sunn',
            align: "center",
            fontSize: 60,
            color: '#000',
            stroke: '#000',
            strokeThickness: 1
        }

        var tiempo = this.data.ganaste? DATA.tiempoATextoUnico(this.data.tiempo) : "-"
        var textoTiempo = this.add.text(gWIDTH/2 +290, 860, tiempo, textoPuntajeEstilo)
        textoTiempo.setOrigin(1, 0.5)
        TweenMax.from(textoTiempo, DATA.t, {scale:0, delay: DATA.t, ease: Back.easeOut.config(7)})

        var puntajeObtenidoNivel = DATA.getScore(this.data.largoPista, this.data.frutas, this.data.tiempo)
        var textoPuntaje = this.add.text(gWIDTH/2 +290, 920, 
            puntajeObtenidoNivel, textoPuntajeEstilo)
        textoPuntaje.setOrigin(1, 0.5)
        TweenMax.from(textoPuntaje, DATA.t, {scale:0, delay: DATA.t*2, ease: Back.easeOut.config(7)})
        
        // botones
        TweenMax.from(btnPlay, DATA.t, {scale:0, delay: DATA.t/2, ease: Back.easeOut.config(3)})
        DATA.animarBoton(btnPlay)
        btnPlay.on("pointerup", ()=> {
            try {
                //if (!APP.standAloneMode) window.parent.saveGameLevels()
                window.parent.saveGameLevels()
            }
            catch(e) {
                console.log(e)
            }
            /*if (this.data.ganaste) {
                trackEvent("popup-winner", "button.play.next.level")
            }
            else {
                trackEvent("popup-loser", "button.return.levels")
            }*/
            if (thisScene.currentLevel == 20 && thisScene.data.ganaste) {
                game.scene.add('GameEndScene', GameEndScene)
                thisScene.cameras.main.once('camerafadeoutcomplete', (camera)=> {
                    game.scene.stop("GameScene")
                    game.scene.remove("GameScene")
                    
                    game.scene.start("GameEndScene")
                    game.scene.bringToTop("GameEndScene")

                    game.scene.stop("LevelEndScene")
                })
                this.cameras.main.fadeOut(200, 0x000000)
            }
            else {
                game.scene.stop("LevelEndScene")
                game.scene.stop("GameScene")
                game.scene.remove("GameScene")
                game.scene.start("TrackPreviewScene", {level: DATA.currentLevel} )//{level: DATA.currentLevel})
                game.scene.bringToTop("TrackPreviewScene")
            }
        })

        TweenMax.from(btnHome, DATA.t, {scale:0, delay: DATA.t/2, ease: Back.easeOut.config(3)})
        DATA.animarBoton(btnHome)
        btnHome.on("pointerup", ()=> {  
            //trackEvent(this.data.ganaste? "popup-winner" : "popup-loser", "button.home")          
            game.scene.stop("LevelEndScene")
            game.scene.stop("GameScene")
            game.scene.remove("GameScene")
            game.scene.start("SplashScene")
        })

        // puntaje
        var bonus = this.data.bonus * DATA.balance.scorePerBonus
        
        if (localStorage.getItem('level_'+ this.currentLevel + '_bonus_score') <= bonus) {
            localStorage.setItem('level_' + this.currentLevel + '_bonus_score', bonus)
        }
        if (localStorage.getItem('level_'+ this.currentLevel + '_score') <= puntajeObtenidoNivel) {
            localStorage.setItem('level_' + this.currentLevel + '_score', puntajeObtenidoNivel)
        }


        var acumulado = 0
        for (var i=1; i<=20; i++) {
            acumulado += parseInt(localStorage.getItem("level_"+i+"_score") || 0)
            acumulado += parseInt(localStorage.getItem("level_"+i+"_bonus_score") || 0)
        }

        var textoAcumulado = this.add.text(gWIDTH/2, gHEIGHT/2 +320, acumulado, {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 70,
            color: '#FFE300',
            stroke: '#000',
            strokeThickness: 3
        })
        textoAcumulado.setOrigin(0.5)
        
        textoPuntajeEstilo.color = '#B11F79'

        var textoNumeroBonus = this.add.text(gWIDTH/2 +290, 800, bonus, textoPuntajeEstilo)
        textoNumeroBonus.setOrigin(1, 0.5)
        TweenMax.from(textoNumeroBonus, DATA.t, {scale:0, delay: DATA.t*2, ease: Back.easeOut.config(7)})
        if (APP.standAloneMode) textoNumeroBonus.alpha = 0

        textoPuntajeEstilo.color = '#EC7B1A'

        var record = parseInt(localStorage.getItem('level_'+this.currentLevel+'_score')) || 0
        var textoRecord = this.add.text(gWIDTH/2 +290, 980, record, textoPuntajeEstilo)
        textoRecord.setOrigin(1, 0.5)
        TweenMax.from(textoRecord, DATA.t, {scale:0, delay: DATA.t*2, ease: Back.easeOut.config(7)})

        var botonLogros = this.add.image(gWIDTH/2 + 200, gHEIGHT/2 + 380, 'botonLogros')
        botonLogros.setInteractive()
        botonLogros.on('pointerover', ()=> {
            TweenMax.to(botonLogros, DATA.t*1.2, {scale:1, ease: Back.easeOut.config(3)})
        })
        botonLogros.on('pointerout', ()=> {
            TweenMax.to(botonLogros, DATA.t/3, {scale:0.8, ease: Back.easeOut.config(3)})
        })
        botonLogros.on("pointerup", ()=> {
            trackEvent("game", "archievement")
            game.scene.start("ArchievementsScene", {parentScene: "LevelEndScene"})
            game.scene.bringToTop("ArchievementsScene")
            game.scene.pause("LevelEndScene")
        })
        botonLogros.setScale(0.8)
        // standalone
        if (APP.standAloneMode) botonLogros.alpha = 0

        /*this.time.delayedCall(2000, ()=> {
            TweenMax.to(textoBonus, DATA.t, {alpha: 1, ease: Power4.easeOut})
            TweenMax.to(textoNumeroBonus, DATA.t, {alpha: 1, ease: Power4.easeOut, delay: DATA.t*0.8})
            TweenMax.to(oso, DATA.t, {y: oso.y + 220, ease: Power4.easeOut})
        }, this)*/

        
    }

    

    update () {
    }
}










