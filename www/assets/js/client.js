









var socket;
var clientName;
var stanzaSelezionata;


var regForm = document.getElementById("regform");
var loginForm = document.getElementById("loginform");
var navbar= document.getElementById("NAVBAR");
var home = document.getElementById("Home");
var classificaDIV = document.getElementById("Classifica");
var account = document.getElementById("Account");
var navHome= document.getElementById("navHOME");
var navAcc=document.getElementById("navAcc");
var navClas=document.getElementById("navClass");
var navShop = document.getElementById("navShop");
var shop = document.getElementById("Shop");

//login 
var email = document.getElementById("emailInput");
var pass = document.getElementById("passwordInput");
var btnLog = document.getElementById("btn-login");
var btntoReg = document.querySelector("#btn-registrati");

//reg

var btnBack = document.getElementById("btn-back");
var btnRegistrazione = document.getElementById("btn-registratiForm");
var regEmail = document.getElementById("emailInputReg");
var regNick = document.getElementById("nickInputReg");
var regPass = document.getElementById("passwordInputReg");
var regPass2 = document.getElementById("passwordInputRip");


//
var btnCreaStanza = document.getElementById("btnStanza");

var divStanza = document.getElementById("stanza");

var table = document.getElementById("tableStanze");


//account holder

var holderNome = document.getElementById("holderNick");
var holderPunti = document.getElementById("holderPunti");
var holderSoldi = document.getElementById("holderSoldi");
var holderImg = document.getElementById("holderImg");
var vetrinaSkinUSer= document.getElementById("skinUser");
var logoutbtn = document.getElementById("btnlogout");

console.log(table);

var blocca = document.getElementById("blocca");
///chat 

const containerMessaggi = document.getElementById("containerMessaggi");
const inputMessage = document.getElementById("inputMessage");
var btnSend = document.getElementById("send_btn");


var turno = document.getElementById("turno");
var abbandona = document.getElementById("quit");

var pathClient;
var pathOpponent;
var clientID;
var listaGettoniUtente

var vetrina = document.getElementById("vetrina");
var conto = document.getElementById("conto");
var classifica;
var moneteClient;

abbandona.addEventListener("click",()=>{

    const userConfirmed = confirm("Sei sicuro di voler abbandonare? Avrai una penalità di 5 punti..");

    if (userConfirmed) {
         socket.emit("userQuit",stanzaSelezionata.id,clientName);
         turno.innerHTML=`ATTENDI  <div class="wrapper">
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
            </div>`;
         stanza.hidden = true;
         home.hidden = false;
         stanzaSelezionata=null;
    
    }
});


var turnoClient;
if(btnSend)
    console.log("attivo");
else
    console.log("nuu"); 


btnSend.addEventListener("click", () => {
    sendMessage();
});


logoutbtn.addEventListener("click",()=>{
        socket.emit("logout");
});

function sendMessage()
{
    const message = inputMessage.value;
    inputMessage.value = "";
    socket.emit("sendMessage", message,clientName,stanzaSelezionata.id);


    const htmlElement = '<div class="d-flex justify-content-end mb-4">\
                            <div class="msg_container_send"> <div class="text-muted h6">'+clientName+'</div>\
                                '+message+'\
                            </div>\
                     </div>';
    containerMessaggi.innerHTML+= htmlElement;


}

function insertMessage (nickname,message)
{
   
    const htmlElement = ' <div class="d-flex justify-content-start mb-4">\
                            <div class="msg_container">\
                                <div class="text-muted h6">'+nickname+'</div>\
                                '+message+'\
                            </div>\
                        </div>';
    containerMessaggi.innerHTML+= htmlElement;

}








function creaCampo()
{
    const rows = 6;
    const cols = 7;
   
    const gameBoard = document.getElementById("game_board");
    gameBoard.innerHTML = '';
    let tableBoard = document.createElement("table");
    turnoClient = false;

    for (let r = 0; r < rows; r++) {
   
    let tr = document.createElement("tr");   
        for (let c = 0; c < cols; c++) {
          
            let td = document.createElement("td");
            const cell = document.createElement('div');
            cell.classList.add('cell', 'empty');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
          
            td.appendChild(cell);
            tr.appendChild(td);
        }
        tableBoard.appendChild(tr);
        
    }
    gameBoard.appendChild(tableBoard);
}


function handleCellClick(event) {
    const col = parseInt(event.target.dataset.col);
    
    
    if(!turnoClient)
    {
        alert("non è il tuo turno");
        return;
    }
    socket.emit("mossa",stanzaSelezionata.id,clientName,col);

}

function classificaLoad()
{
    classifica=[];
    console.log("carica");
    axios.get("/api/classifica").then(response =>{
        console.log(response.data.classifica);
        let tableclass = document.getElementById("tableClass");
        let tbody =tableclass.getElementsByTagName("tbody")[0];
        tbody.innerHTML="";
        let pos = 1;
        for(let row of response.data.classifica)
        {
            let tr = document.createElement("tr");
            let tdPos = document.createElement("td");
            tdPos.innerText = pos;
            tr.appendChild(tdPos);
            let tdNick = document.createElement("td");
            tdNick.innerHTML=row.nickname;
            tr.appendChild(tdNick);
            let tdPunti = document.createElement("td");
            tdPunti.innerHTML=row.punti;
            tr.appendChild(tdPunti);

            tbody.appendChild(tr);
            pos++;
            
        }
    });
}


btnCreaStanza.addEventListener("click",()=>{

    socket.emit("creaStanza",clientName);

    creaCampo();

    home.hidden = true;
    divStanza.hidden =false;    

});


function removeStanza(stanzaId)
{
    console.log("voglio rimuovere "+ stanzaId);
    let tbody = table.getElementsByTagName("tbody")[0];
    let tr = tbody.querySelector(`tr[data-id="${stanzaId}"]`).remove();
    
}


function entra(stanzaOBJ)
{
    console.log(stanzaOBJ);
    stanzaSelezionata = stanzaOBJ;
    socket.emit("userjoin",stanzaOBJ.id,clientName); 
    socket.emit("iniziaGioco",stanzaOBJ);
    creaCampo();
    home.hidden = true;
    divStanza.hidden =false;
 //   divStanza.innerHTML += "Sei nella stanza di " + stanzaOBJ.host;

    

}


function inserisciStanza(stanza)
{
   
    let tbody = table.getElementsByTagName("tbody")[0];
    let tr = document.createElement("tr");
    tr.setAttribute("data-id",stanza.id);
    let tdId = document.createElement("td");
    tdId.innerHTML=stanza.id;
    tr.appendChild(tdId);
    let tdNome = document.createElement("td");
    tdNome.innerHTML=stanza.nome;
    tr.appendChild(tdNome);

    let tdHost = document.createElement("td");;
    tdHost.innerHTML=stanza.host;
    tr.appendChild(tdHost);

    let tdBtn = document.createElement("td");
    let button = document.createElement("button");
    button.className = 'btn btn-primary';
    button.innerHTML = 'Entra';
    button.onclick = function() {
    entra(stanza);
    };
    tdBtn.appendChild(button);
    tr.appendChild(tdBtn);
    tbody.appendChild(tr);
}

async function homeLoad()
{

    console.log("id = "+ clientID);
    axios.get("/api/stanze").then(response=>{
        var s = response.data.rooms;
        let tbody = table.getElementsByTagName("tbody")[0];
        tbody.innerHTML="";
        console.log(s);
            for(let stanza of s)
            {
                console.log("host = " + stanza.host + " guest =  " + stanza.guest);
                if(stanza.host != clientName && stanza.guest=="")
                {
                        inserisciStanza(stanza);
                    
                }
            }
    });
}


async function compra(g)
{
    const data=
    {
        idC:clientID,idG:g.id
    };
    const risposta = await axios.post("/api/aquista",data);
    if(risposta.data.msg =="noMoney")
    {
          //  alert("Non hai abbastanza soldi..");
          let a = $("#alNoSoldi");
          a.fadeIn();

          setTimeout(function(){
            a.fadeOut();

          },1000);
        return;
    }

    if(risposta.data.msg =="err")
    {
        alert("C'è stato un errore improvviso");
        return;
    }

    if(risposta.data.msg=="Acquistato"){
        //alert("Acquisto effettuato con successo!");
        let a = $("#alAcquisto");
        a.fadeIn(); 
        setTimeout(function(){
            a.fadeOut();

          },1000);

        shopLoad(); 
    }
}


async function shopLoad()
{
    conto.innerHTML="";
    vetrina.innerHTML="";
    const data ={
        id:clientID
    };
    const resC = await axios.post("/api/user/conto",data);
    conto.innerHTML="$"+resC.data.soldi;
    moneteClient=resC.data.soldi;

    
    const resGettUser = await axios.post("/api/user/gettoni",data);

    listaGettoniUtente= resGettUser.data.gettoniUtente;
    let listaIDGettoni= [];
    for (let g of listaGettoniUtente)
        listaIDGettoni.push(g.id);

    const respGettoni = await axios.get("/api/gettoni");
    console.log("ut "+ listaGettoniUtente.length + " res " +respGettoni.data.gettoni.length );
    if(listaGettoniUtente.length == respGettoni.data.gettoni.length)
    {
        vetrina.innerHTML="<h1>Hai comprato tutte le skin. In futuro ne aggiungeremo altre.</h1>";
    }

    for(let g of respGettoni.data.gettoni)
    {
    console.log("g= "+ g.id + ""+ listaIDGettoni.includes(g.id));

        if(!listaIDGettoni.includes(g.id))
        {
            const cardShop = document.createElement('div');
            cardShop.className = 'cardShop mb-3';

 
            const img = document.createElement('img');
            img.className = 'card-img-top';
            img.src = g.path;
            cardShop.appendChild(img);

  
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
        
            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = `$ ${g.costo}`;
            cardBody.appendChild(title);

            cardShop.appendChild(cardBody);

            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary';
            button.textContent = 'Acquista';
            button.onclick = async function() {
                compra(g);
                };
            cardBody.appendChild(button);

            vetrina.appendChild(cardShop);
           
        }
       
    }

}


async function cambio(s)
{
    const data={
        idUs:clientID,
        skin:s
    }
    const res= await axios.post("/api/user/cambiaSkin",data);
    if(res.data.msg=="err")
    {
        alert("errore");
        return;
    }
    if(res.data.msg=="ok")
    {
       // alert("Skin cambiata con successo");
       let a= $("#changeAlert");
       a.fadeIn();
       setTimeout(function()
    {
        a.fadeOut();
    },1000);
    accountLoad();
    }
    
}


async function accountLoad()
{
    const data ={
        id:clientID
    }

    vetrinaSkinUSer.innerHTML="";
    holderNome.innerHTML = clientName;
    const resC = await axios.post("/api/user/conto",data);
    holderSoldi.innerHTML="$"+resC.data.soldi;

    const resPunti = await axios.post("/api/user/punti",data);
    holderPunti.innerHTML = resPunti.data.punti + "punti";

    const resImg = await axios.post("/api/user/activeSkin",data);
    holderImg.src = resImg.data.path;

    const resSkin = await axios.post("/api/user/skins",data);
    for(let s of resSkin.data.skins)
    {
        console.log("aaa" +s.id);
        const cardShop = document.createElement('div');
        cardShop.className = 'cardShop mb-3';


        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = s.path;
        cardShop.appendChild(img);


        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
    
        if(resImg.data.path == s.path)
        {
            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = `IN USO`;
            cardBody.appendChild(title);
    
            cardShop.appendChild(cardBody);
                
        }else
        {
            
    
          
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary';
            button.textContent = 'ATTIVA';
            button.onclick = async function() {
                   cambio(s);
                };
            cardBody.appendChild(button);
            cardShop.appendChild(cardBody);
    
        }

      

       
        vetrinaSkinUSer.appendChild(cardShop);
        
    }
}

navClas.addEventListener("click",()=>{
    if(stanzaSelezionata) return;
    home.hidden=true;
    classificaDIV.hidden=false;
    account.hidden=true;
    shop.hidden=true;
});

navHome.addEventListener("click",()=>{
    if(stanzaSelezionata) return;

    home.hidden=false;
    classificaDIV.hidden=true;
    account.hidden=true;
    shop.hidden=true;
    homeLoad();
});

navAcc.addEventListener("click",()=>{
    if(stanzaSelezionata) return;

    home.hidden=true;
    classificaDIV.hidden=true;
    account.hidden=false;
    shop.hidden=true;
    accountLoad();
});

navShop.addEventListener("click",()=>{
    if(stanzaSelezionata) return;

    home.hidden=true;
    classificaDIV.hidden=true;
    account.hidden=true;
    shop.hidden=false;
    shopLoad();
});


function nascondiTutto()
{
    home.hidden=true;
    classificaDIV.hidden=true;
    account.hidden=true;
    shop.hidden=true;
    navbar.hidden=true;
}



btnLog.addEventListener("click",()=>{
        if(email.value =="" || pass.value =="" )
        {
           let a = $("#AlertEMPTY");
           a.fadeIn();
           setTimeout(function(){
            a.fadeOut();
           },1000);
            return;
        }
        const data = {email:email.value, 
            pass:pass.value
        };

        axios.post("/api/login",data).then(response =>{
            if(response.data.msg == "ok")
            {
              
                socket = io();
                socket.on("connect",async()=>{
                    console.log("connesso");
                    loginForm.classList="hidden";
                    navbar.hidden=false;
                    home.hidden = false;
                    axios.post("/api/nick",data).then(response=>{
                        if(response.data.msg =="ok")
                        {
                            socket.emit("userLogged",response.data.nickname);
                            clientName =response.data.nickname;
                            clientID = response.data.id;
                            console.log("ID"+clientID);
                        }
                    });
                    homeLoad();
                    classificaLoad();
                });

                socket.on("partitaFinita",(id,nome,abbandono)=>{
                    classificaLoad();
                    if(!stanzaSelezionata) return;
                    if(stanzaSelezionata.id == id)
                    {
                        console.log("nome = "+ nome + " abb "+ abbandono + "client "+ clientName);
                        if(abbandono && nome!=clientName)
                        {
                            alert("L'avversario ha abbanonato la partita, torni alla home");
                            stanza.hidden = true;
                            home.hidden = false;
                            turno.innerHTML=`ATTENDI  <div class="wrapper">
                            <div class="circle"></div>
                            <div class="circle"></div>
                            <div class="circle"></div>
                            <div class="shadow"></div>
                            <div class="shadow"></div>
                            <div class="shadow"></div>
                        </div>`;
                        containerMessaggi.innerHTML="";

                        }
                        stanzaSelezionata = null;

                    }
                })

                socket.on("pareggio",(id)=>{
                    if(!stanzaSelezionata) return;

                    if(stanzaSelezionata.id == id)
                    {
                        var alPar = $("#alPar");
                        alPar.fadeIn();
                        setTimeout(function(){
                           alPar.fadeOut();
                           stanza.hidden = true;
                           home.hidden = false;
                           turno.innerHTML=`ATTENDI  <div class="wrapper">
                           <div class="circle"></div>
                           <div class="circle"></div>
                           <div class="circle"></div>
                           <div class="shadow"></div>
                           <div class="shadow"></div>
                           <div class="shadow"></div>
                       </div>`;
                       containerMessaggi.innerHTML="";
   
                           classificaLoad();
                           stanzaSelezionata=null;
                        },5000);
                        
                    }
                });

                socket.on("setPath",async(id,nomeHost,nomeGuest)=>{
                    if(!stanzaSelezionata) return;
                    if(stanzaSelezionata.id == id)
                    {
                        if(clientName ==nomeHost)
                        {
                            let data={
                                nickname:nomeHost
                            };
                            const resC = await axios.post("/api/skin",data);
                            pathClient = resC.data.skin;

                            let data2={
                                nickname:nomeGuest
                            };
                            const resO = await axios.post("/api/skin",data2)
                            pathOpponent = resO.data.skin;

                           
                        }

                        if(clientName == nomeGuest)
                        {
                            let data={
                                nickname:nomeGuest
                            };
                            const resC = await axios.post("/api/skin",data);
                            pathClient = resC.data.skin;

                            let data2={
                                nickname:nomeHost
                            };
                            const resO = await axios.post("/api/skin",data2)
                            pathOpponent = resO.data.skin;
                        }

                        console.log("CLIENT = "+ pathClient + " , OPP= " + pathOpponent);
                      
                        if(pathClient == pathOpponent)
                        {
                            console.log("uguali");
                            pathOpponent = "images/default.png";
                        }
                    }
                });

                socket.on("controlloFinito",(id,nome,esito)=>{
                    if(!stanzaSelezionata) return;

                    if(stanzaSelezionata.id == id)
                    {
                        var alertV = $('#alVit');
                        var alertS = $('#alSconf');
                        console.log("esito = "+esito);
                        if(nome == clientName && esito)
                        {

                            alertV.fadeIn();
                            setTimeout(function() {
                                alertV.fadeOut(); // Nasconde l'alert con effetto fade dopo 3 secondi
                                stanza.hidden = true;
                                home.hidden = false;
                                turno.innerHTML=`ATTENDI  <div class="wrapper">
                                <div class="circle"></div>
                                <div class="circle"></div>
                                <div class="circle"></div>
                                <div class="shadow"></div>
                                <div class="shadow"></div>
                                <div class="shadow"></div>
                            </div>`;
                            containerMessaggi.innerHTML="";
                                
                                stanzaSelezionata=null;
                                classificaLoad();
                            }, 5000);
                            

                        }
                        if(nome !=clientName && esito)
                        {
                            alertS.fadeIn();
                            setTimeout(function(){
                                alertS.fadeOut();
                                stanza.hidden = true;
                                home.hidden = false;
                                turno.innerHTML=`ATTENDI  <div class="wrapper">
                                <div class="circle"></div>
                                <div class="circle"></div>
                                <div class="circle"></div>
                                <div class="shadow"></div>
                                <div class="shadow"></div>
                                <div class="shadow"></div>
                            </div>`;
                                containerMessaggi.innerHTML="";
                                stanzaSelezionata=null;
                                classificaLoad();
                            },5000);
                           

                        } 
                        
                    }

                });

                socket.on("aggiornaClassifica",()=>{
                    console.log("aggiorno la classifica");
                    classificaLoad();   
                });
                socket.on("stanzaRimossa",()=>{
                    homeLoad();
                })


                socket.on("giocoIniziato",(id,giocatore)=>{
                    if(!stanzaSelezionata) return;




                    if(stanzaSelezionata.id == id)
                    {


                        turno.innerText+="\nInizia "+ giocatore;
                        if(giocatore !=clientName)
                        {
                            turnoClient = false;
                        }else
                            turnoClient = true;


                
                    }



                });

                socket.on("mossaEseguita",(id,nome,riga,colonna)=>{
                    if(!stanzaSelezionata) return;

                    console.log("moss" +stanzaSelezionata.id + "   ss "+ id);
                    if(stanzaSelezionata.id === id)
                    {
                        console.log("riga "+ riga);
                    
                        if(riga!=null)
                        {
                            let colore ="red";
                            const data = {
                                idS:id
                            };
                            axios.post("/api/stanze/turno",data).then(res =>{
                                console.log("Cambio turno "+ res.data.turno);
                                if(res.data.turno == clientName)
                                {
                                    turnoClient =true;

                                }else
                                {
                                    turnoClient = false;
                                }

                                turno.innerText = "Turno di "+ res.data.turno;
                            });

                            let currentRow=0;
                            const interval = setInterval(()=>{
                                const prevCell = document.querySelector(`.cell[data-row='${currentRow - 1}'][data-col='${colonna}']`);
                                if (prevCell) {
                                    prevCell.style.backgroundImage = ''; 
                                }
                                const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-col='${colonna}']`);
                                // cell.classList.remove('empty');
                                
                                 if(nome!=clientName)
                                 {
                                     cell.style.backgroundImage = `url('${pathOpponent}')`;
                                 }else
                                 {
                                     cell.style.backgroundImage = `url('${pathClient}')`;
                                 }

                                 currentRow++;
                                 if (currentRow > riga)
                                 {
                                     clearInterval(interval); 
                                     socket.emit("checkVittoria",id,nome);
                                 }
                                 cell.style.backgroundRepeat = "no-repeat"; // The background image will not repeat (default is repeat)
                                 cell.style.backgroundPosition = "center"; 
                                
                            },150);
                        
                            
                           
                          
                           // cell.classList.add(colore);
                          
                        }
                    }

                });


                socket.on("StanzaCreata",(s)=>{

                   // console.log("host " + s.host + " sono "+ clientName);
                    if(s.host!= clientName)
                    {
                        inserisciStanza(s);
                        
                    }else
                    {
                        inserisciStanza(s);
                        stanzaSelezionata =s;
                        console.log("Ho creato la stanza "+ stanzaSelezionata.id + " (" +s.id+")");

                        //fare l'attesa



                        
                    }

                });

                socket.on("newMessage",(nicknameSender, message,idStanza) => {
                    if(!stanzaSelezionata) return
                    if(stanzaSelezionata.id ==idStanza)
                        insertMessage(nicknameSender, message);
                });
                
                socket.on("disconnect",()=>{
                    nascondiTutto();
                    socket.emit("removeDiscon",clientName);
                    loginForm.classList="container-fluid h-100";
                });


                socket.on("userDisconnected",()=>{
                    homeLoad();
                });


                socket.on("userjoined",(id,nome)=>{
                        removeStanza(id);  
                    if(!stanzaSelezionata) return;

                     
                    console.log("nome = "+ nome + " client "+ clientName + " stanza "+ id + " sel " +stanzaSelezionata.id);
               


                    if(nome != clientName)
                    {
                        if(stanzaSelezionata.id == id)
                        {
                           
                          turno.innerText = "è entrato "+ nome + ", la partita può iniziare";
                        }
                    }

                });



            }else
            {
            let a = $("#AlertERRATI");
            a.fadeIn();
            setTimeout(function()
            {
                a.fadeOut();
            },1000);
            }

        });
});




btntoReg.addEventListener("click",()=>{

   loginForm.classList = "container-fluid h-100 hidden";
   regForm.classList = "container-fluid h-100";


});


btnBack.addEventListener("click",()=>{
    loginForm.classList = "container-fluid h-100 ";
    regForm.classList = "container-fluid h-100 hidden";

});

btnRegistrazione.addEventListener("click",async()=>{

    if(regPass.value == "" || regPass2 == "" || regEmail == "" || regNick == "")
    {
        let a = $("#AlertEMPTYREG");
        a.fadeIn();
        setTimeout(function(){
            a.fadeOut();
        },1000);
        return;
    }
    
    if(regPass.value != regPass2.value)
    {
        let a = $("#AlertNONUGUALE");
        a.fadeIn();
        setTimeout(function(){
            a.fadeOut();
        },1000);
        
        return;
    }

    const nomiResp = await fetch("/info/nicknames");
    const nomiList = await nomiResp.json();
    console.log(nomiList);

    for(let nickame of nomiList)
    {
        //console.log("nick=  "+ nickame);
        if(nickame == regNick.value)
        {
                alert("Nome utente già in uso");
                return;
        }
    }
    

    const emailResp =  await fetch("/info/emails");
    const emailList = await emailResp.json();
    console.log(emailList);

    for(let em of emailList)
    {
        console.log("email "+ em);
        if(em == regEmail.value)
        {
                alert("Email già in uso");
                return;
         }
        
    }
  

    //TUTTO OK, può registrarsi

    const user={email:regEmail.value ,nickame:regNick.value,pass: regPass.value,punti:0};
    console.log(user);

    axios.post("/api/registra",user).then(response => {
        // Gestisci la risposta del server
        let msg = response.data.msg;
        if(msg == "ok")
        {
          //  alert("Registrazione effettuata con successo");
          let a  = $("#AlertREG");
          a.fadeIn();
          setTimeout(function(){
            a.fadeOut();
          },1000);
            regForm.classList ="hidden";
            loginForm.classList = "container-fluid h-100";
        }else
        {
            alert("Qualcosa è andato storto :( ");
        }
    });   



});


