class CharacterSelectionScene extends Phaser.Scene {
    constructor ()
    {
        super('CharacterSelectionScene');

        this.level = 0
    }
    init(d) {
        this.level = d.level
    }
    preload() {       
        // this.load.image('pandaCharacter', 'assets/images/screens/character-selection/panda.png')
        // this.load.image('pardoCharacter', 'assets/images/screens/character-selection/grizz.png')
        // this.load.image('polarCharacter', 'assets/images/screens/character-selection/polar.png')
        // this.load.image('botonAnterior', 'assets/images/screens/character-selection/selection-previous-button.png')
        // this.load.image('botonSiguiente', 'assets/images/screens/character-selection/selection-next-button.png')
        // this.load.image('botonJugar', 'assets/images/screens/character-selection/selection-play-button.png')
    }
    create() {
        var thisScene = this
        var desfaseX = 200
        var desfaseY = 85

        var backBlack = this.add.graphics()
        backBlack.fillStyle(0x000000, 0.5)
        backBlack.fillRect(0, 0, gWIDTH, gHEIGHT)

        var pandaCharacter = this.add.image(gWIDTH/2, gHEIGHT*0.3+20, 'pandaCharacter')
        var pardoCharacter = this.add.image(gWIDTH/2, gHEIGHT*0.3, 'pardoCharacter')
        var polarCharacter = this.add.image(gWIDTH/2, gHEIGHT*0.3+5, 'polarCharacter')

        var botones = {
            anterior:   this.add.image(gWIDTH/2 -160, gHEIGHT*0.47, 'botonAnterior'),
            siguiente: this.add.image(gWIDTH/2 +160, gHEIGHT*0.47, 'botonSiguiente'),
            jugar: this.add.image(gWIDTH/2, gHEIGHT*0.58, 'botonJugar'),
        }
        Object.values(botones).forEach(b => {
            DATA.animarBoton(b)
        });
        botones.anterior.on('pointerup', getPrevious)
        botones.siguiente.on('pointerup', getNext)
        botones.jugar.on('pointerup', goPlay)

        var characterList = 
        { 
            'panda': pandaCharacter, 
            'pardo': pardoCharacter, 
            'polar': polarCharacter
        }

        var osoSeleccionadoLocal = 'pardo'
        setBear(osoSeleccionadoLocal)

        function getNext() {
            switch (osoSeleccionadoLocal) {
                case 'panda': setBear('pardo'); break;
                case 'pardo': setBear('polar'); break;
                case 'polar': setBear('panda'); break;
            }
        }

        function getPrevious() {
            switch (osoSeleccionadoLocal) {
                case 'panda': setBear('polar'); break;
                case 'pardo': setBear('panda'); break;
                case 'polar': setBear('pardo'); break;
            }
        }

        function setBear(oso) {
            osoSeleccionadoLocal = oso
            trackEvent("game", "level:"+ thisScene.level+ ":character:"+osoSeleccionadoLocal)
            thisScene.children.bringToTop(characterList[oso])
            thisScene.children.bringToTop(botones.anterior)
            thisScene.children.bringToTop(botones.siguiente)
        }

        function goPlay() {
            DATA.hayUnOsoSeleccionado = true
            DATA.osoSeleccionado = osoSeleccionadoLocal
            trackEvent("game", osoSeleccionadoLocal)
            game.scene.resume("GameScene")
            game.scene.stop("CharacterSelectionScene")
        }
    }
    update () {
    }
}