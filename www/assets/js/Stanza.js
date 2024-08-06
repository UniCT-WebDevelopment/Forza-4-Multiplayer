
 class Stanza{

    socketHost;
    turno;
    colonne;
    righe;
    id;
    host;
    guest;
    campo;
    gettoneHost;
    gettoneGuest;
    inGioco;
    nome;
    constructor(id,host,nome,socketHost)
    {
        this.colonne=7;
        this.righe=6;
        this.id = id;
        this.host=host;
        this.nome = nome;
        this.turno = host;
        this.socketHost =socketHost;
        this.campo=new Array(this.righe);
        for(let i =0; i< this.righe;i++)
        {
            this.campo[i] = new Array(this.colonne);
        }
        this.guest="";
        this.gettoneHost=0;
        this.gettoneGuest=0;
        this.inGioco = false;
    }


    setGuest(guest)
    {
       // console.log("setto guest   "+guest);
        this.guest = guest;
    }


    setGettoneHost(colore)
    {
        this.gettoneHost=colore;
    }

    setGettoneGuest(colore)
    {
        this.gettoneGuest=colore;
    }

    inserisci(colore,colonna,giocatore)
    {
    
        if (!this.inGioco) return null;

      
        if (giocatore !== this.turno) return null;

    
        if (colonna < 0 || colonna >= this.campo[0].length) return null;

        if (this.campo[0][colonna] !== 0) return null;

      
        let i = 5;
        while (i >= 0 && this.campo[i][colonna] !== 0) {
            i--;
        }

        
        if (i >= 0) {
            this.campo[i][colonna] = colore;

        
            this.turno = (this.turno === this.host) ? this.guest : this.host;

        
            return i;
        }

   
        return null;
    }





    checkDirection(row, col, dRow, dCol,daControllare) {
        if (this.campo[row][col] !== daControllare) {
            return false;
        }

        for (let i = 1; i < 4; i++) {
            const r = row + i * dRow;
            const c = col + i * dCol;
            if (r < 0 || r >= this.righe || c < 0 || c >= this.colonne || this.campo[r][c] !== daControllare) {
                return false;
            }
        }
        return true;
    }

    checkVictory(daControllare) {
        
    
        // Controllo quattro direzioni per una vittoria
        
    
        // Controlla ogni cella della griglia
        for (let row = 0; row < this.righe; row++) {
            for (let col = 0; col < this.colonne; col++) {
                if (this.checkDirection(row, col, 0, 1,daControllare) ||  // Orizzontale
                    this.checkDirection(row, col, 1, 0,daControllare) ||  // Verticale
                    this.checkDirection(row, col, 1, 1,daControllare) ||  // Diagonale dal basso a sinistra all'alto a destra
                    this.checkDirection(row, col, 1, -1,daControllare)) { // Diagonale dall'alto a sinistra al basso a destra
                    return true;
                }
            }
        }
    
        return false;  // Nessun vincitore per il giocatore specificato
    }

    controlloVittoria(daControllare)
    {
        if(!this.inGioco) return;
        console.log("Sto controllando ", daControllare);    

        //tutte le righe
        for(let i = 0;i<this.righe;i++)
        {
            if(this.campo[i][0]+this.campo[i][1]+this.campo[i][2]+this.campo[i][3] == 4*daControllare 
                ||
                this.campo[i][3]+this.campo[i][4]+this.campo[i][5]+this.campo[i][6] == 4*daControllare ||
                this.campo[i][1]+this.campo[i][2]+this.campo[i][3]+this.campo[i][4] == 4*daControllare ||
                this.campo[i][2]+this.campo[i][3]+this.campo[i][4]+this.campo[i][5] == 4*daControllare
            )
            return true;
        }

        //tutte le colonne

        for(let i = 0;i<this.colonne;i++)
            {

                if(this.campo[0][i]+this.campo[1][i]+this.campo[2][i]+this.campo[3][i] == 4*daControllare
                    || this.campo[2][i]+this.campo[3][i]+this.campo[4][i]+this.campo[5][i] == 4*daControllare
                )
                return true;
            }

        //diagonali
        
        for(let i = 0; i<3;i++)
        {
            if(this.controlloDiagonale(i,0,daControllare))
                return true;  
        }
              

        for(let i=1; i<4;i++)
         {  
            if(this.controlloDiagonale(0,i,daControllare))
                return true;
        }

        for(let i = 1; i<4;i++)
        {
            if( this.controlloDiagonale(2,i,daControllare))
                return true;
        }
        
        if(this.controlloDiagonale(1,3,daControllare))
            return true


        
        if(this.controlloDiagonale(1,1,daControllare))
            return true

        
        if(this.controlloDiagonale(1,2,daControllare))
            return true



        return false;
    }





    controlloDiagonale(i,j,daControllare)
    {
        let somma =0;
        let iFinale = i+3;
        let jFinale = j+3;

        //console.log("start i = "+i+ " fine i = "+ iFinale + " start j = "+j+" fine "+jFinale);
        while(i<=iFinale && j<=jFinale )
        {       
            somma+=this.campo[i][j];
            j++;
            i++;
            
           
        }
        
        if(somma == 4*daControllare) 
            return true;

        return false;
    }



    visualizzaCampo()
    {
        let rr="";
        for(let i =0; i< this.righe;i++)
            {
                let riga ="";
                for(let j = 0;j<this.colonne;j++)
                 {
                    riga+=this.campo[i][j]+"\t ";
                    rr+=this.campo[i][j]+"\t "
                 } 
                 rr+="\n";
               console.log(riga);  
            }
       // return rr;
    }

    campoPieno()
    {
        for(let i =0; i< this.righe;i++)
            {
                for(let j = 0;j<this.colonne;j++)
                 {
                    if(this.campo[i][j]==0)
                        return false; 
                 } 
            }

        return true;    

    }

    scegliTurno()
    {
        let rand = Math.floor(Math.random() * 100);
        console.log("estratto " +rand  +" H "+this.host + " G "+this.guest);
        if(rand <=50)
            return this.host;

        return this.guest;
    }

    gioca(coloreH,coloreG)
    {
        if(this.inGioco) return;
        if(this.guest =="") 
        {
            console.log("Errore guest");
            return;
        }
        console.log("GIOCO INIZIATO");
        this.inGioco = true;
        this.turno = this.scegliTurno();
        console.log("inizia "+ this.turno);
        //campo a 0;
        for(let i =0; i< this.righe;i++)
        {
            for(let j = 0;j<this.colonne;j++)
                this.campo[i][j] = 0;
        }

        this.gettoneHost=coloreH;
        this.gettoneGuest=coloreG;
      

    }



}

// Esportazione della classe
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Stanza; // CommonJS (Node.js)
  } else {
    window.Stanza = Stanza; // ES6 Modules (Browser)
  }