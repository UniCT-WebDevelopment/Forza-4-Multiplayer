const sql =require("mysql");
const MD5 = require("crypto-js/md5");
require("dotenv").config();

const host = process.env.HOST;
const usr = process.env.USR;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;




const connection= sql.createConnection({
    host:host,
    user:usr,
    password:password,
    database:database  
});

connection.connect();


const connetti= async()=>
    {

        
        
        connection.query("select * from utenti",(err,res)=>{

        });
    
        return connection;
    };


const query =(q,callback) =>{

    connection.query(q,callback);
}

const query2= (q) =>{

    return new Promise((resolve, reject) => {
        connection.query(q,(error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
    };
inizializza();









async function inizializza()
{
        creaTableUser();
        creaTableGettoni();
        creaTableAcquista();  
}







async function creaTableAcquista()
{
    let q = `CREATE TABLE IF NOT EXISTS acquisti (idUtente int(11) NOT NULL,idGettone int(11) NOT NULL)`;
    connection.query(q,(err,res)=>{
        if( err) throw err;

    })
}


async function creaTableUser() {
    let q = `CREATE TABLE  IF NOT EXISTS utenti(id int(11) PRIMARY KEY AUTO_INCREMENT,email varchar(20) NOT NULL,nickname varchar(20) NOT NULL,
  pass varchar(32) NOT NULL,
  punti int(11) NOT NULL,
  monete int(11) NOT NULL,
  activeSkin varchar(50) NOT NULL
)`;

connection.query(q,(err,res)=>{
        if(err) throw err;
        

        connection.query("CREATE TRIGGER IF NOT EXISTS `gettoneRed` AFTER INSERT ON `utenti` FOR EACH ROW INSERT INTO acquisti (idUtente, idGettone) VALUES (NEW.id, 5)",(err,res)=>{
            if(err) throw err;
        });

});






    
}


async function creaTableGettoni()
{   
    let q = `CREATE TABLE  IF NOT EXISTS gettoni (
  id int(11) NOT NULL,
  path varchar(32) NOT NULL,
  costo int(11) NOT NULL
    )`;

    connection.query(q,(err,res)=>{
        if(err) throw err;


    });
    

    
    let qInsert = `INSERT IGNORE INTO gettoni (id, path, costo) VALUES
                    (1, 'images/mario.png', 150),
                    (2, 'images/charizard.png', 70),
                    (3, 'images/dragon.png', 25),
                    (4, 'images/pikachu.png', 50),
                    (5, 'images/red.png', 0),
                    (6, 'images/sonic.png', 50),
                    (7, 'images/star.png', 10),
                    (8, 'images/wario.png', 35),
                    (9, 'images/yellow.png', 0),
                    (10, 'images/sponge.png', 40),
                    (11, 'images/spongeMeme.png', 15),
                    (12, 'images/deadpool.png', 300),
                    (13, 'images/spiderman.png', 120);
                    `;

    connection.query(qInsert,(err,res)=>{
        if(err) throw err;
    });
}
module.exports = {
    query,connetti
  };
