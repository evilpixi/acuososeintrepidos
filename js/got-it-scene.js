class GotItScene extends Phaser.Scene {
    constructor ()
    {
        super('GotItScene')
    }
    preload() {
        
    }
    create() {
        var thisScene = this
        var modalPreJuego = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height/2+30, 'modalPreJuego')
        //modalPreJuego.visible = false
        var botonEntendido = this.add.image(this.sys.canvas.width/2, this.sys.canvas.height*0.47,'botonEntendido')
        //botonEntendido.visible = false
        botonEntendido.setInteractive()
        botonEntendido.on("pointerup", function (pointer) {
            trackEvent("game", "remember")
            localStorage.setItem('gotIt', true)
            DATA.gotIt = true
            thisScene.scene.stop()
        })

        botonEntendido.on('pointerover', ()=> {
            TweenMax.to(botonEntendido, DATA.t*1.2, {scale:1.2, ease: Back.easeOut.config(3)})
        })
        botonEntendido.on('pointerout', ()=> {
            TweenMax.to(botonEntendido, DATA.t/3, {scale:1, ease: Back.easeOut.config(3)})
        })
    }
    update () {
    }
}