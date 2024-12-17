class ArchievementsScene extends Phaser.Scene {
    constructor ()
    {
        super("ArchievementsScene")
        this.data

        this.cantidadesConseguidas = {
            accesories: 0,
            stickers: 0,
            filters: 0
        }
        this.cantidadesTotales = {
            accesories: 0,
            stickers: 0,
            filters: 0
        }
        

        this.indiceAccesorioActual
        this.indiceStickerActual
        this.indiceFiltroActual

        this.accesories
        this.stickers
        this.filters
    }
    init(d) {
        this.data = d
    }
    preload() {
        game.scene.pause(this.data.parentScene)
    }
    create() {
        this.indiceStickerActual = 0
        this.indiceFiltroActual = 0
        this.indiceAccesorioActual = 0

        var thisScene = this
        this.add.rectangle(0, 0, gWIDTH*2, gHEIGHT*2, 0x000000, 0.5)

        this.add.image(gWIDTH/2, gHEIGHT/2, 'ArchievementsPopup')
        var btnClose = this.add.image(gWIDTH/2 + 300, 370, 'ArchievementsClose')

        var posStickers = {
            x: gWIDTH/2 -170,
            y: gHEIGHT/2 -70
        }
        var posFilters = {
            x: gWIDTH/2 +230,
            y: gHEIGHT/2 -70
        }
        var posAccesories = {
            x: gWIDTH/2 +20,
            y: gHEIGHT/2 +310
        }

        var formatoTexto = {
            fontFamily: 'a-hint-of-sass',
            align: "center",
            fontSize: 40,
            color: '#FFFFFF',
            stroke: '000000',
            strokeThickness: 7
        }

        var txtProgresoStickers = this.add.text(posStickers.x+0, posStickers.y+23, '0/0', formatoTexto)
        var txtProgresoAccesorios = this.add.text(posAccesories.x+0, posAccesories.y+23, '0/0', formatoTexto)
        var txtProgresoFiltros = this.add.text(posFilters.x+0, posFilters.y+23, '0/0', formatoTexto)
        var txtProg = {
            'accesory': txtProgresoAccesorios,
            'sticker': txtProgresoStickers,
            'filter': txtProgresoFiltros
        }

        var btnHereAlbum =   this.add.image(gWIDTH/2+100, gHEIGHT/2 +90, 'ArchievementsHere').setScale(0)
        var btnHereProfile = this.add.image(gWIDTH/2+100, gHEIGHT/2 +450, 'ArchievementsHere').setScale(0)
        var textoAlbum = this.add.image(gWIDTH/2-100, gHEIGHT/2 +90, 'ArchievementAlbumText').setScale(0)
        var textoProfile = this.add.image(gWIDTH/2-110, gHEIGHT/2 +450, 'ArchievementProfileText').setScale(0)


        function getIfMax(tag) {
            var cant = 0
            var max = DATA.levelBonusDistribution[tag].length
            for (var i = 1; i <= max; i++) {
                if (localStorage.getItem(tag+'_'+(i)) != null) cant++
            }
            if (max == 0) return false
            return (cant == max)
        }

        APP.filters_names.concat(APP.stickers_names).forEach(name => {
            if (getIfMax(name)) {
                btnHereAlbum.setScale(1)
                textoAlbum.setScale(1)
            }
        })
        APP.accesories_names.forEach(name => {
            if (getIfMax(name)) {
                btnHereProfile.setScale(1)
                textoProfile.setScale(1)
            }
        })


        this.accesories = []
        this.stickers = []
        this.filters = []
        for (var i=1; i<=APP.filters_amount; i++) {
            var f = thisScene.add.image(posFilters.x, posFilters.y, 'filter-ui-unlocked-'+i)
            this.filters.push(f)
            f = thisScene.add.image(posFilters.x, posFilters.y, 'filter-ui-locked-'+i)
            this.filters.push(f)
        }
        for (var i=1; i<=APP.stickers_amount; i++) {
            var s = thisScene.add.image(posStickers.x, posStickers.y, 'sticker-ui-unlocked-'+i)
            this.stickers.push(s)
            s = thisScene.add.image(posStickers.x, posStickers.y, 'sticker-ui-locked-'+i)
            this.stickers.push(s)
        }
        for (var i=1; i<=APP.accesories_amount; i++) {
            var a = this.add.image(posAccesories.x, posAccesories.y, 'accesory-ui-unlocked-'+i)
            this.accesories.push(a)
            a = this.add.image(posAccesories.x, posAccesories.y, 'accesory-ui-locked-'+i)
            this.accesories.push(a)
        }
        var imgProg = {
            'accesory': thisScene.accesories,
            'sticker': thisScene.stickers,
            'filter': thisScene.filters
        }
        var btnPrevSticker = this.add.image(posStickers.x -124, posStickers.y, 'ArchievementsPrev')
        var btnNextSticker = this.add.image(posStickers.x +124, posStickers.y, 'ArchievementsNext')
        var btnPrevAccesory = this.add.image(posAccesories.x -134, posAccesories.y, 'ArchievementsPrev')
        var btnNextAccesory = this.add.image(posAccesories.x +134, posAccesories.y, 'ArchievementsNext')
        var btnPrevFilter = this.add.image(posFilters.x -124, posFilters.y, 'ArchievementsPrev')
        var btnNextFilter = this.add.image(posFilters.x +124, posFilters.y, 'ArchievementsNext')

        DATA.animarBoton(btnPrevAccesory)
        DATA.animarBoton(btnNextAccesory)
        DATA.animarBoton(btnPrevSticker)
        DATA.animarBoton(btnNextSticker)
        DATA.animarBoton(btnPrevFilter)
        DATA.animarBoton(btnNextFilter)

        var estrellas = 0
        for (var i=1; i<=20; i++) {
            estrellas += parseInt(localStorage.getItem("level_"+i+"_stars")) || 0
        }
        formatoTexto.fontSize = 70
        var txtEstrellas = this.add.text(gWIDTH/2+100, gHEIGHT/2 -300, 'x'+estrellas, formatoTexto)
        
        // botones
        DATA.animarBoton(btnHereAlbum)
        btnHereAlbum.on("pointerup", ()=> {
            trackEvent("popup-archievements", "button.album")
            try {
                window.parent.openalbum()
            }
            catch {
                console.warn("openalbum() not implemented")
            }
        })

        DATA.animarBoton(btnHereProfile)
        btnHereProfile.on("pointerup", ()=> {      
            trackEvent("popup-archievements", "button.profile")      
            try {
                window.parent.openprofile()
            }
            catch {
                console.warn("openprofile() not implemented")
            }
        })

        DATA.animarBoton(btnClose)
        btnClose.on("pointerup", ()=> {cerrarVentana()})
        function cerrarVentana() {
            game.scene.resume(thisScene.data.parentScene)
            game.scene.stop("ArchievementsScene")
            game.scene.remove("ArchievementsScene")
            game.scene.add("ArchievementsScene", ArchievementsScene)
        }

        
        this.indiceAccesorioActual = 0
        this.indiceStickerActual = 0
        this.indiceFiltroActual = 0
        btnPrevAccesory.on("pointerup", ()=> {
            thisScene.indiceAccesorioActual = thisScene.indiceAccesorioActual == 0 ? APP.accesories_amount-1 : thisScene.indiceAccesorioActual-1
            actualizar('accesory', thisScene.indiceAccesorioActual)
        })
        btnNextAccesory.on("pointerup", ()=> {
            thisScene.indiceAccesorioActual = thisScene.indiceAccesorioActual == APP.accesories_amount-1 ? 0 : thisScene.indiceAccesorioActual+1
            actualizar('accesory', thisScene.indiceAccesorioActual)
        })
        btnPrevSticker.on("pointerup", ()=> {
            thisScene.indiceStickerActual = thisScene.indiceStickerActual == 0 ? APP.stickers_amount-1 : thisScene.indiceStickerActual-1
            actualizar('sticker', thisScene.indiceStickerActual)
        })
        btnNextSticker.on("pointerup", ()=> {
            thisScene.indiceStickerActual = thisScene.indiceStickerActual ==  APP.stickers_amount-1 ? 0 : thisScene.indiceStickerActual+1
            actualizar('sticker', thisScene.indiceStickerActual)
        })
        btnPrevFilter.on("pointerup", ()=> {
            thisScene.indiceFiltroActual = thisScene.indiceFiltroActual == 0 ? APP.filters_amount-1 : thisScene.indiceFiltroActual-1
            actualizar('filter', thisScene.indiceFiltroActual)
        })
        btnNextFilter.on("pointerup", ()=> {
            thisScene.indiceFiltroActual = thisScene.indiceFiltroActual ==  APP.filters_amount-1 ? 0 : thisScene.indiceFiltroActual+1
            actualizar('filter', thisScene.indiceFiltroActual)
        })



        function actualizar(tag, indice) {
            var cant = 0
            var max = DATA.levelBonusDistribution[tag+'-'+(indice+1)].length
            for (var i = 0; i < max; i++) {
                if (localStorage.getItem(tag+'-'+(indice+1)+'_'+(i+1)) != null) cant++
            }
            
            var indiceImagen = indice*2
            if (cant != max || cant == 0) indiceImagen++

            thisScene.children.bringToTop(imgProg[tag][indiceImagen])
            txtProg[tag].setText(cant+'/'+max)
            thisScene.children.bringToTop(txtProg[tag])
        }
        
        actualizar('accesory', thisScene.indiceAccesorioActual)
        actualizar('sticker', thisScene.indiceStickerActual)
        actualizar('filter', thisScene.indiceFiltroActual)
        //this.children.bringToTop(this.filters[this.filtroActual])
    }

    

    update () {
    }
}