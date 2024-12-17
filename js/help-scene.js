class HelpScene extends Phaser.Scene {
    constructor ()
    {
        super("HelpScene");

        this.estado = 1
        this.backs = []
        this.imgs = []
        this.parentScene
    }
    init(d) {
        this.parentScene = d
    }
    preload() {
        
    }
    create() {
        var thisScene = this
        this.estado = 1
        this.add.rectangle(0, 0, gWIDTH*2, gHEIGHT*2, 0x000000, 0.5)
        /*Object.values(DATA.music).forEach(m => {
            if (m) m.setVolume(0.1)
        })*/
        
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && i!=3) {
            this.backs.push(this.add.image(gWIDTH/2, gHEIGHT/2, 'helpBack1'))
            this.imgs.push(this.add.image(gWIDTH/2, gHEIGHT/2, 'helpImg1'))
        }
        else {
            this.backs.push(this.add.image(gWIDTH/2, gHEIGHT/2, 'helpBack2'))
            this.imgs.push(this.add.image(gWIDTH/2, gHEIGHT/2, 'helpImg2'))
        }
        for (var i=3; i<=6; i++) {
            this.backs.push(this.add.image(gWIDTH/2, gHEIGHT/2, 'helpBack'+i))
            this.imgs.push(this.add.image(gWIDTH/2, i!=6? gHEIGHT*0.55 : gHEIGHT*0.55 +50, 'helpImg'+i))
        }
        this.imgs.forEach(img => img.setScale(0.9))
        for (var i=0; i<=4; i++) {
            this.backs[i].depth = 1
            this.imgs[i].depth = 1
        }
        this.backs[this.estado-1].depth = 2
        this.imgs[this.estado-1].depth = 2
        
        var oso = this.add.image(gWIDTH/2-250, 1470, 'helpGrizz')

        TweenMax.to(oso, DATA.t*2, {
            y: gHEIGHT-300,
            ease: Elastic.easeOut.config(1, 0.6)
        })
        
        var btnPrev = this.add.image(gWIDTH/2 + 40, 1200, 'btnAyudaAnterior')
        var btnNext = this.add.image(gWIDTH/2 + 260, 1200, 'btnAyudaSiguiente')
        var btnClose = this.add.image(gWIDTH/2 + 300, 370, 'btnAyudaCerrar')
        btnPrev.alpha = 0

        btnPrev.depth = 10
        btnNext.depth = 10
        btnClose.depth = 10
        oso.depth = 10
        
        TweenMax.from(btnPrev, DATA.t, {scale:0, delay: DATA.t/2, ease: Back.easeOut.config(3)})
        TweenMax.from(btnNext, DATA.t, {scale:0, delay: DATA.t/2, ease: Back.easeOut.config(3)})
        TweenMax.from(btnClose, DATA.t, {scale:0, delay: DATA.t/2, ease: Back.easeOut.config(3)})

        DATA.animarBoton(btnPrev)
        DATA.animarBoton(btnNext)
        DATA.animarBoton(btnClose)

        btnPrev.on("pointerup", ()=> {
            switch (this.estado) {
                //case 1: 
                case 2: btnPrev.alpha = 0; break;
                /*case 3:
                case 4: */
                case 5: btnNext.alpha = 1; break;
            }       
            this.estado--;
            for (var i=0; i<=4; i++) {
                this.backs[i].depth = 1
                this.imgs[i].depth = 1
            }
            this.backs[this.estado-1].depth = 2
            this.imgs[this.estado-1].depth = 2

            trackEvent("game", "help:page-"+this.estado)
        })
        btnNext.on("pointerup", ()=> {
            switch (this.estado) {
                case 1: btnPrev.alpha = 1; break;
                /*case 2:
                case 3: */
                case 4: btnNext.alpha = 0; break;
                //case 5:
            }
            this.estado++;
            for (var i=0; i<=4; i++) {
                this.backs[i].depth = 1
                this.imgs[i].depth = 1
            }
            this.backs[this.estado-1].depth = 2
            this.imgs[this.estado-1].depth = 2
        })
        btnClose.on("pointerup", ()=> {cerrarVentana()})

        function cerrarVentana() {
            trackEvent("game", "help:close")
            game.scene.resume(thisScene.parentScene)
            game.scene.stop("HelpScene")
            game.scene.remove("HelpScene")
            game.scene.add("HelpScene", HelpScene)
        }
    }
    update () {
    }
}










