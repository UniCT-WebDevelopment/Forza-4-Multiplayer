
const Stanza = require("./www/assets/js/Stanza.js");
const express = require("express");
const serverHttpExpress = express();
const serverHttp = require('http').Server(serverHttpExpress);
const serverSocketIO = require('socket.io')(serverHttp);
serverHttpExpress.use(express.static("./www"));
serverHttpExpress.use('/images', express.static('images'));

serverHttpExpress.use(express.json());
serverHttpExpress.use(express.urlencoded({ extended: true }));
const sql =require("mysql");
const MD5 = require("crypto-js/md5");


const db = require('./db');
const { get } = require("http");

db.connetti();

var utentiOnline=0;
var utentiLoggati=[];
var stanze =[];
var actualIdStanza=0;
var listaGettoni=[];
getGettoni();




function assegnaPunti(id,nome,skt)
{
    for(let index in stanze)
    {
        if(stanze[index].id == id)
        {

            stanze[index].inGioco = false;
            let qu = `UPDATE utenti set punti=punti+3,monete=monete+100 where nickname='${nome}'`;
            console.log("Punti e monete assegnati a " +nome);
            db.query(qu,(err,res)=>{
                    if(err) throw err;
                    skt.broadcast.emit("aggiornaClassifica");
            });
            if(nome == stanze[index].host)
            {
                let qu = `UPDATE utenti set punti=punti-3,monete=monete-50 where nickname='${stanze[index].guest}'`;
                //console.log("eseguo " +qu);
            console.log("Punti e monete tolti a " +stanze[index].guest);
                
                db.query(qu,(err,res)=>{
                        if(err) throw err;
                        skt.broadcast.emit("aggiornaClassifica");
                });
            }else
            {
                let qu = `UPDATE utenti set punti=punti-3,monete=monete-50 where nickname='${stanze[index].host}'`;
               // console.log("eseguo " +qu);
            console.log("Punti e monete tolti a " +stanze[index].host);
                
                db.query(qu,(err,res)=>{
                        if(err) throw err;
                        skt.broadcast.emit("aggiornaClassifica");
                });
            }
            stanze.splice(index,1);
            skt.emit("stanzaRimossa");
            
          }
        

    }



}

function assegnaPareggio(id,socket)
{
    for(let index in stanze)
        {
            if(stanze[index].id == id)
            {
                stanze[index].inGioco = false;
                let qu = `UPDATE utenti set punti=punti+1 where nickname='${stanze[index].host}' or nickname='${stanze[index].guest}'`;
                console.log("Pareggio per stanza " + stanze[index].id);
                db.query(qu,(err,res)=>{
                        if(err) throw err;
                });
                stanze.splice(index,1);
                socket.emit("stanzaRimossa");
            }
        }
}

serverSocketIO.on("connection",(socketClient) =>{
    console.log("client collegato");
   


   

    socketClient.on("disconnect",() =>{
        console.log("client disconnesso");
        for(let i in stanze)
        {
            if(stanze[i].socketHost == socketClient.id)
            {
                stanze.splice(i,1);
                socketClient.broadcast.emit("userDisconnected");
            }
                
        }
       
    });



    socketClient.on("userLogged",(nickname)=>{
            console.log("si è collegato "+nickname);
            utentiOnline++;
            utentiLoggati.push(nickname);
        
    });

    socketClient.on("creaStanza",(nickame)=>{
        actualIdStanza++;
        let s = new Stanza(actualIdStanza,nickame,"Stanza di " + nickame,socketClient.id);
        stanze.push(s);
        console.log("Nuova stanza creata da "+ nickame + "(id= " + s.id + ")");
       serverSocketIO.emit("StanzaCreata",s);
    });



    socketClient.on("sendMessage",(msg,nick,id) =>{
        console.log("Nuovo messaggio da " + nick+ " nella stanza "+id+ " : " + msg);
        socketClient.broadcast.emit("newMessage",nick,msg,id);
    });

    socketClient.on("userjoin",(stanzaid,clientName)=>{
        let st;
        for(let s of stanze)
        {
            if(s.id == stanzaid)
            {
                console.log(clientName+" è entrato nella stanza di " + s.host);
                s.guest = clientName;
                st =s;
            }
        }
        serverSocketIO.emit("setPath",st.id,st.host,st.guest);
        serverSocketIO.emit("userjoined",stanzaid,clientName);
           
    });

    socketClient.on("iniziaGioco",(st)=>{

        //console.log(st);
        for(let s of stanze)
        {
           /// console.log("confronto "+s.id +" con " +st.id);
            if(s.id == st.id)
            {
                console.log("Inizia il gioco nella stanza "+ s.id + " (host = "+s.host + " - guest= " + s.guest + ")");
                s.gioca(1,-1);
                //s.visualizzaCampo();
                serverSocketIO.emit("giocoIniziato",s.id,s.turno);

            }
        }
        /*
        st.gioca(-1,1);
        st.visualizzaCampo()*/
    });

    socketClient.on("userQuit",(id,nome)=>{
        for(let index in stanze)
            {
                if(stanze[index].id == id)
                {
                    stanze[index].inGioco = false;
                    let qu = `UPDATE utenti set punti=punti-5 where nickname='${nome}'`;
                   // console.log("eseguo " +qu);
                    db.query(qu,(err,res)=>{
                            if(err) throw err;
                    });
                    console.log(nome+" ha quittato dalla partita " + id );
                }

                stanze.splice(index,1);
                socketClient.emit("stanzaRimossa");
                socketClient.broadcast.emit("partitaFinita",id,nome,true);
            }

    });

    socketClient.on("checkVittoria",(id,nome)=>
    {
      //  console.log("checking id= "+id + " nome "+ nome);
        let vittoria;
        for(let stanza of stanze)
            {
                if(stanza.id == id)
                {
                    //console.log("host = " + stanza.host + " guest = "+stanza.guest);
                    //console.log("colore host" + stanza.coloreHost + " g " + stanza.coloreGuest );
                    if(nome == stanza.host)
                        vittoria = stanza.checkVictory(stanza.gettoneHost);
                    else
                      vittoria =  stanza.checkVictory(stanza.gettoneGuest);
                    
                //      console.log("vit" + vittoria);

                      //settaggio punti
                        if(vittoria)
                        {
                            console.log("Nella stanza di " + stanza.host + " ha vinto: " + nome);
                            assegnaPunti(id,nome,socketClient);
                            serverSocketIO.emit("controlloFinito",stanza.id,nome,vittoria);
                        }

                        if(!vittoria && stanza.campoPieno())
                        {
                            console.log("pareggio");
                            assegnaPareggio(id,socketClient);
                            serverSocketIO.emit("pareggio",(id));
                        }


                }
            }
        
    });

    socketClient.on("mossa",(id,nome,colonna)=>{
       
        let riga;
        for(let stanza of stanze)
        {
            if(stanza.id == id)
            {
              //  console.log("host = "+ stanza.host + " nome "+nome);
                if(stanza.host == nome)
                 riga = stanza.inserisci(stanza.gettoneHost,colonna,stanza.host);
                
                if(stanza.guest == nome)
                   riga = stanza.inserisci(stanza.gettoneGuest,colonna,stanza.guest);
                console.log("Stanza id: "+ id + " - mossa da parte di "+nome);
               // console.log(stanza.visualizzaCampo());
                serverSocketIO.emit("mossaEseguita",stanza.id,nome,riga,colonna);
            }
        }
    });

    socketClient.on("logout",()=>{
        socketClient.disconnect();
    });

    
});

async function getGettoni()
{
   // console.log("AAAAAAAAAAAAa");
    //let listaGettoni=[];
    let query =  "select * from gettoni order by costo ASC";

     db.query(query,(err,res)=>{
        if(err) throw err;
        for(let g of res)
            listaGettoni.push(g);


   // console.log("ci sono "+ listaGettoni.length);
        
    
    });

  // console.log("ci sono "+ listaGettoni.length);
}

function getCosto(id)
{
   
    for(let g of listaGettoni)
    {
        //console.log("abbiamo "+ g.id);
        if(g.id ==id)
            return g.costo;
    }
        

    return -1;
}

serverHttpExpress.post("/api/aquista",(req,resp)=>{
        const data = req.body;
        let CostoGettoneSelezionato = getCosto(data.idG);
      //  console.log("sto cercando "+data.idG+" ho trovato "+ CostoGettoneSelezionato);
        if(CostoGettoneSelezionato !=-1)
        {
            let MoneteUser;
            let q = "Select monete from utenti where id ="+data.idC;
          //  console.log("q "+q);
            db.query(q,(err,res)=>{
                if(err) throw err;
                
                for(let r of res)
                {

                    //console.log("res= "+ r + " mon "+ r.monete);
                    MoneteUser = r.monete;

                

                   // console.log("monete = "+ MoneteUser);

                    if(MoneteUser >=CostoGettoneSelezionato)
                    {
                        let qUpdate = `Update utenti set monete=monete-${CostoGettoneSelezionato} where id=${data.idC}`;
                        let qInsert =`Insert into acquisti(idUtente,idGettone) values(${data.idC},${data.idG})`;

                        db.query(qUpdate,(err,res)=>{
                            if(err) throw err;
                        })
                        db.query(qInsert,(err,res)=>
                        {
                            if(err) throw err;
                        });
                        resp.json({ msg: "Acquistato" });
                       /* db.beginTransaction((err) => {
                            if (err) throw err;
                    
                            // Esegui la query di aggiornamento
                            db.query(qUpdate, (err, results) => {
                                if (err) {
                                    return db.rollback(() => {
                                        throw err;
                                    });
                                }
                    
                                // Esegui la query di inserimento
                                db.query(qInsert, (err, results) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            throw err;
                                        });
                                    }
                    
                                    // Completa la transazione
                                    db.commit((err) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                throw err;
                                            });
                                        }
                                      //  console.log('Transaction Complete.');
                                     
                                  
                                    });
                                });
                            });
                        });*/
                    }else
                    {
                       resp.json({msg:"noMoney"});
                    }
                }
                   
            });

         

        }else
        {
            resp.json({msg:"err"});
        }
        
});


serverHttpExpress.post("/api/user/skins",(req,resp)=>{
    const data = req.body;
    let q = `SELECT gettoni.id,gettoni.path,gettoni.costo FROM gettoni INNER JOIN acquisti on gettoni.id = acquisti.idGettone WHERE acquisti.idUtente =${data.id};`;
    db.query(q,(err,res)=>{
        if(err) throw err;
        //console.log("res = "+res);

        
            resp.json({skins:res});

        
       
    });
});

serverHttpExpress.post("/api/user/cambiaSkin",(req,resp)=>{

    const data =req.body;
    //controllo se l'utente possiede la skin;
    let q = `select * from acquisti where idUtente=${data.idUs} and idGettone=${data.skin.id}`;
   // console.log("AAAA"+ q);
    db.query(q,(err,res)=>{
            if(err) throw err;
            if(res.length ==1)
            {
                let q2= `UPDATE utenti set activeSkin='${data.skin.path}' where id=${data.idUs}`;
                db.query(q2,(er,re)=>{
                    if(er) throw er;
                    resp.json({msg:"ok"});
                });
            }else
            {
                resp.json({msg:"err"});
            }
    });

});

serverHttpExpress.post("/api/skin",(req,resp)=>{
    const data = req.body;
    let q = `select activeSkin from utenti where nickname='${data.nickname}'`;
    db.query(q,(err,res)=>{
        if(err) throw err;
      //  console.log("res = "+res);

        for(let s of res)
        {
            resp.json({skin:s.activeSkin});

        }
       
    });
});
serverHttpExpress.post("/api/stanze/turno",(req,resp)=>{
    const data = req.body;
   // console.log("controllo " + data.idS);
    for(let stanza of stanze)
    {
        if( stanza.id == data.idS)
        {
            resp.json({turno:stanza.turno});
        }
    }


});

serverHttpExpress.get("/api/classifica",(req,resp)=>{

    let q = "Select nickname,punti from utenti order by punti DESC LIMIT 10";
    db.query(q,(err,res)=>{
        if(err) throw err;
       // console.log(res);
        resp.json({classifica:res});
    });
});

serverHttpExpress.get("/api/stanze",(req,resp)=>{
        //console.log(stanze);
        resp.json({rooms:stanze});
});

serverHttpExpress.post("/api/user/gettoni",(req,resp)=>{


    let q = `SELECT gettoni.id,gettoni.path,gettoni.costo from acquisti INNER join utenti on acquisti.idUtente = utenti.id
    inner join gettoni on gettoni.id=acquisti.idGettone WHERE utenti.id =${req.body.id}`;
    db.query(q,(err,res)=>{
        if(err) throw err;
      
        resp.json({gettoniUtente:res});
    })

});

serverHttpExpress.get("/api/gettoni",(req,resp)=>{
  
    resp.json({gettoni:listaGettoni});
    /*
    let query =  "select * from gettoni";
    db.query(query,(err,res)=>{
        if(err) throw err;
      
        resp.json({gettoni:res});
    })*/
});

serverHttpExpress.post("/api/user/activeSkin",(req,resp)=>{
    const data = req.body;
    let q = `Select activeSkin from utenti where id='${data.id}'`;
    db.query(q,(err,res)=>{
        if(err) throw err;
        if(res.length ==1)
        {
            for(let s of res)
            {
                
                resp.json({path:s.activeSkin});

            }
        }
    });

});

serverHttpExpress.post("/api/user/punti",(req,resp)=>{
    const data = req.body;
    let q = `Select punti from utenti where id='${data.id}'`;
    db.query(q,(err,res)=>{
        if(err) throw err;
        if(res.length ==1)
        {
            for(let p of res)
            {
              //  console.log(p.punti);
                resp.json({punti:p.punti});

            }
        }
    });

});

serverHttpExpress.post("/api/user/conto",(req,resp)=>{
    const data = req.body;
   // console.log(data.id);
    let q = `Select monete from utenti where id='${data.id}'`;
    db.query(q,(err,res)=>{
        if(err) throw err;
        if(res.length ==1)
        {
            for(let m of res)
            {
         //       console.log(m.monete);
                resp.json({soldi:m.monete});

            }
        }
    });
});


serverHttpExpress.post("/api/nick",(req,resp)=>{
    const data = req.body;
    let qry = "Select nickname,id from utenti where email='" + data.email + "'";
   // console.log("aa "+qry);
    db.query(qry,(err,res)=>{
     
        if(err)
        {
                   resp.json({msg:"err"});
                   throw err;            
        }
        if(res.length ==1)
        {
                for(let nick of res)
                {
                    // console.log("DD0"+ nick.id);
                      resp.json({msg:"ok",nickname:nick.nickname,id:nick.id});
                  
                }
        } else
            resp.json({msg:"err"});
    }) ;

});

serverHttpExpress.post("/api/login",(req,resp)=>{

        const data = req.body;
        let pass = MD5(data.pass).toString();
        let qry = `Select * from utenti where email='${data.email}' and pass='${pass}'` ;
     //  console.log(qry);
        db.query(qry,(err,result)=>{
            if(err)
             {
                    resp.json({msg:"err"});
                    throw err;            
             }
             //console.log("res= "+ result.length);

             if(result.length ==1)
                resp.json({msg:"ok"});
             else
                resp.json({msg:"noLog"});
        });
});

serverHttpExpress.post("/api/registra",(req,resp)=>{

        const user = req.body;
        
        let qry = `Insert into utenti(id,email,nickname,pass,punti,monete,activeSkin) VALUES(NULL,'${user.email}','${user.nickame}',MD5('${user.pass}'),'${user.punti}','50','images/red.png')`;
        db.query(qry,(err,resul)=>
        {
            if(err)
            {
                
                resp.json({msg:"err"});
                throw err;            
            }else
            {
                resp.json({msg:"ok"});
            }

        });
});

serverHttpExpress.get("/info/emails",(req,resp)=>{
    let qry = "Select email from utenti";
    var emails =[];
    db.query(qry,(err,result)=>{
        if(err) throw err;

        if(result.length>=1)
        {

            for( let email of result)
            {
              //  console.log("ho trovato "+ email.email);

                emails.push(email.email);
            }

        }  
        //console.log("L"+     emails.length);
   
        resp.json(emails);  
    });


});


serverHttpExpress.get("/info/nicknames",(req,resp)=>{
    let qry = "Select nickname from utenti";
    var nicks = [];
    db.query(qry,(err,result)=>{
        if(err) throw err;

        if(result.length>=1)
        {

            for(let  nick of JSON.parse(JSON.stringify(result)))
            {
              //  console.log("ho trovato "+ nick.nickname);
                nicks.push(nick.nickname);
            }

        }    
        resp.json(nicks);
    });


});




















serverHttp.listen(8080);