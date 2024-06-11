import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import bcrypt from "bcrypt";

const app= express();
const port= 3000;
const saltRounds=10;

const db=new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "GallFamily",
  password: "ammiabba401",
  port: 5068,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.get("/login", (req, res)=>{
    res.render("login.ejs");
});

app.get("/register", (req, res)=>{
    res.render("register.ejs");
});

app.post("/register", async(req, res)=>{
    const email= req.body.username;
    const password= req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM members WHERE email = $1", [
          email,
        ]);
    
        if (checkResult.rows.length > 0) {
          res.send("Email already exists. Try logging in.");
        } else {
          bcrypt.hash(password, saltRounds, async(err, hash)=>{
            if(err){
              console.log("error hashing password",(err));
            }
            else{
              const result = await db.query(
                "INSERT INTO members (email, password) VALUES ($1, $2)",
                [email, hash]
              );
              console.log(result);
              res.render("secrets.ejs");
            }
          });
          
        }
    }
    catch(err){
        console.log(err);
    }
});

app.post("/login", async (req,res)=>{
    const email= req.body.username;
    const loginPassword= req.body.password;

    try{
        const result = await db.query("SELECT * FROM members WHERE email = $1", [
            email,
          ]);

        if(result.rows.length>0){
            console.log(result);
            const user = result.rows[0];
            const storedHashedPassword = user.password;

            bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
                if (err) {
                  console.error("Error comparing passwords:", err);
                } else {
                  if (result) {
                    res.render("secrets.ejs");
                  } else {
                    res.send("Incorrect Password");
                  }
                }
              });
        }else{
            res.send("user not found");
        }
    }catch(err){
        console.log(err);
    }

});

app.listen(port, ()=>{
    console.log('server runing on port',[port]);
});

