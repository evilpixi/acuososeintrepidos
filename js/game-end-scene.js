function addThoursandsSeparators(number) {
    let s = ""+number
    let cont = 0
    for (var i = s.length; i>0; i--) {
        let sAnt = s
        cont++
        if (cont==3 && i!=1) {
            cont = 0
            s = s.substr(0,i-1) + "." + s.substr(i-1)
        }
    }
    return s
}

class GameEndScene extends Phaser.Scene {
    constructor ()
    {
        super("GameEndScene");
    }
    create() {
        var puntajeFinal = 0
        for (var i = 1; i<=20; i++) {
            puntajeFinal += Number(localStorage.getItem('level_'+i+'_score'))
            puntajeFinal += Number(localStorage.getItem('level_'+i+'_bonus_score'))
        }
        const scoreTextFormat = {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 95,
            color: '#FFE300',
            stroke: '000000',
            strokeThickness: 4
        }

        this.add.rectangle(0, 0,           gWIDTH*2, gHEIGHT*0.2, 0x4AB3FE)
        this.add.rectangle(0, gHEIGHT*0.8, gWIDTH*2, gHEIGHT*0.4, 0x009BB5)

        this.add.image(gWIDTH/2, gHEIGHT/2, 'end-splash')
        var endOsos = this.add.image(gWIDTH/2, gHEIGHT*0.8, 'splash-bears')
        TweenMax.from(endOsos, DATA.t*4,{y:endOsos.y +20, ease: Sine.easeInOut}).yoyo(true).repeat(-1)

        let nextBtn = this.add.image(gWIDTH*0.85, gHEIGHT*0.7, 'trackPreviewPlayButton')
        nextBtn.scale = 0
        DATA.animarBoton(nextBtn)
        nextBtn.on('pointerup', ()=> {
            //trackEvent("popup-congratulation", "button.next")
            game.scene.pause("GameEndScene")
            game.scene.add("GameEndPopupScene", GameEndPopupScene)
            game.scene.start("GameEndPopupScene", {score: puntajeFinal})
        })

        let textoPuntajeSplash = this.add.text(gWIDTH/2, gHEIGHT*0.49, addThoursandsSeparators(puntajeFinal) + ' PTS', scoreTextFormat)
        textoPuntajeSplash.setOrigin(0.5)
        if (textoPuntajeSplash.width > 560) textoPuntajeSplash.setFontSize(80)
        textoPuntajeSplash.scale = 0

        //endSplash.alpha = 0
        this.tweens.add({
            targets: this.bgRect,
            alpha: { value: 0, duration: 300, ease: 'Power1'},
            onComplete: ()=> {
                this.tweens.add({ 
                    targets: textoPuntajeSplash, 
                    scale: {value: 1, duration: 300, ease: 'Back.easeOut'}
                })
                this.tweens.add({ 
                    targets: nextBtn, 
                    scale: {value: 1, duration: 200, ease: 'Back.easeOut', delay: 1300}
                })
            }
        })
    }
}

class GameEndPopupScene extends Phaser.Scene {
    constructor ()
    {
        super("GameEndPopupScene");

        this.data = {}
    }
    init(d) {
        this.data = d
    }
    create() {
        this.add.rectangle(0, 0, gWIDTH*2, gHEIGHT*2, 0x000000, 0.7)
        this.add.image(gWIDTH/2, gHEIGHT/2, 'end-popup')
        var bears = this.add.image(gWIDTH/2, gHEIGHT*0.8, 'popup-bears')
        var completeButton = this.add.image(gWIDTH*0.8+28, gHEIGHT*0.5+44, 'complete-archievements-button')
        var uncompleteButton = this.add.image(gWIDTH*0.8+28, gHEIGHT*0.5+44, 'uncomplete-archievements-button')
        var newGameButton = this.add.image(gWIDTH*(0.5 - 0.2), gHEIGHT*0.6, 'new-game-button')
        var continuePlayingButton = this.add.image(gWIDTH*(0.5 + 0.2), gHEIGHT*0.6, 'continue-playing-button')

        this.add.text(gWIDTH/2, gHEIGHT*0.2, '')
        
        DATA.animarBoton(completeButton)
        DATA.animarBoton(uncompleteButton)
        DATA.animarBoton(newGameButton)
        DATA.animarBoton(continuePlayingButton)

        // score stuff
        var bonusOcurrenceList = Object.values(DATA.levelBonusDistribution).flat()
        var bonusCount = 0
        bonusOcurrenceList.forEach(bonus => {
            let b = bonus.split("__",-1)
            bonusCount += localStorage.getItem(b[0]+"_"+b[1]) != null ? 1 : 0
        })
        if (bonusCount < bonusOcurrenceList.length) {
            completeButton.alpha = 0
        } else {
            uncompleteButton.alpha = 0
        }
        [ completeButton, uncompleteButton].forEach(b => {
            b.on('pointerup', ()=> {
                //trackEvent("popup-congratulation.final", "button.archievements")
                game.scene.start("ArchievementsScene", {parentScene: "GameEndPopupScene"})
                game.scene.bringToTop("ArchievementsScene")
            })
        })
        var countTextStyle = {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 47,
            color: '#FFFFFF',
            stroke: '000000',
            strokeThickness: 6
        }

        var fruitCount = 0
        var starsCount = 0
        for (var i=1; i<=20; i++) {
            fruitCount += Number(localStorage.getItem("level_"+i+"_fruits_collected"))
            starsCount += Number(localStorage.getItem("level_"+i+"_stars"))
        }
        this.add.text(gWIDTH*0.8+7, gHEIGHT/2 -120, 'x'+fruitCount, countTextStyle)
        this.add.text(gWIDTH*0.8+7, gHEIGHT/2 -264, 'x'+starsCount, countTextStyle)


        // texto puntaje
        var textPuntaje = this.add.text(gWIDTH/2, gHEIGHT/2 -400, addThoursandsSeparators(this.data.score) + ' PTS', {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 95,
            color: '#FFE300',
            stroke: '000000',
            strokeThickness: 7
        }).setShadow(7, 7, 'rgba(0,0,0,0.7)', 5)
        textPuntaje.setOrigin(0.5)
        if (textPuntaje.width > 560) textPuntaje.setFontSize(80)

        newGameButton.on('pointerup', ()=> {
            //trackEvent("popup-congratulation.final", "button.new.game")
            game.scene.pause("GameEndPopupScene")
            game.scene.add("NewGameScene", NewGameScene)
            game.scene.start("NewGameScene")
            game.scene.bringToTop("NewGameScene")
        })
        continuePlayingButton.on('pointerup', ()=> {
            //trackEvent("popup-congratulation.final", "button.continue.game")
            game.scene.start("SplashScene")
            game.scene.bringToTop("SplashScene")
            game.scene.stop("GameEndPopupScene")
            game.scene.remove("GameEndPopupScene")
            game.scene.stop("GameEndScene")
            game.scene.remove("GameEndScene")
        })

        TweenMax.to(bears, DATA.t*3, {scale: 1.05, ease: Sine.easeInOut}).yoyo(true).repeat(-1)
    }
}

class NewGameScene extends Phaser.Scene {
    constructor ()
    {
        super("NewGameScene");
    }
    create() {
        this.add.rectangle(0, 0, gWIDTH*2, gHEIGHT*2, 0x000000, 0.8)
        this.add.image(gWIDTH/2, gHEIGHT/2, 'new-game-popup')
        var botonSi = this.add.image(gWIDTH/2 - 120, gHEIGHT/2 -100, 'yes-button')
        var botonNo = this.add.image(gWIDTH/2 + 120, gHEIGHT/2 -100, 'no-button')

        DATA.animarBoton(botonSi)
        DATA.animarBoton(botonNo)

        botonSi.on('pointerup', ()=> {
            trackEvent("game", "new-game:yes")
            localStorage.clear()
            game.scene.start("SplashScene")
            game.scene.bringToTop("SplashScene")
            game.scene.stop("GameEndPopupScene")
            game.scene.remove("GameEndPopupScene")
            game.scene.stop("GameEndScene")
            game.scene.remove("GameEndScene")
            game.scene.stop("NewGameScene")
            game.scene.remove("NewGameScene")
        })
        botonNo.on('pointerdown',  ()=> {
            trackEvent("game", "new-game:no")
            game.scene.resume("GameEndPopupScene")
            game.scene.stop("NewGameScene")
            game.scene.remove("NewGameScene")
        })
    }
}