import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcryp from 'bcrypt'
import express from 'express'


const router = express.Router()

router.post("/employee_login", (req, res) => {
    const sql = "SELECT * from employee Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });
      if (result.length > 0) {
        bcryp.compare(req.body.password, result[0].password, (err, response) => {
            if (err) return res.json({ loginStatus: false, Error: "Wrong Password"});
            if (response) {
                const email = result [0].email;
                const token = jwt.sign(
                    { role:"employee", email: email, idEmployee: result[0].idEmployee },
                    "jwt_secret_key",
                    {expiresIn: "1d"}                    
                );
                res.cookie('token', token);
                return res.json({ loginStatus: true, idEmployee: result[0].idEmployee});
            }
        })
        
      } else {
        return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }
    });
  });

router.get('/detail/:idEmployee', (req, res) => {
    const idEmployee = req.params.idEmployee;
    const sql = "SELECT * FROM employee where idEmployee = ?"
    con.query(sql, [idEmployee], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export {router as EmployeeRouter}