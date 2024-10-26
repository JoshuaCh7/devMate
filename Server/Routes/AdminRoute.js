import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcryp from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, idEmployee: result[0].idEmployee},
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
  });
});

router.get('/category', (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
})

//image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Public/Images')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: storage
})
//end image umpload

router.post('/add_category', (req, res) => {
  const sql = "INSERT INTO category (`nameCategory`) VALUES (?)"
  con.query(sql, [req.body.category], (err, result) => {
    if(err) return res.json({Status: false, Error:"Query Error"})
    return res.json({Status: true})
  })
})

router.post('/add_employee', upload.single('image'), (req, res) => {
  const sql = `INSERT INTO employee
  (name, email, password, image, idCategory)
  VALUES (?)`;
  bcryp.hash(req.body.password, 10, (err, hash) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    const values = [
      req.body.name, 
      req.body.email,
      hash,
      req.file.filename,
      req.body.idCategory
    ]
    con.query(sql, [values], (err, result) => {
      if(err) return res.json({Status: false, Error: err})
      return res.json({Status: true})
    })
  })
})

router.get('/employee', (req, res) => {
  const sql = "SELECT * FROM employee";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error:"Query Error"})
    return res.json({Status: true, Result: result})
  })
})

router.get('/employee/:idEmployee', (req, res) => {
  const id = req.params.idEmployee;
  const sql = "SELECT * FROM employee WHERE idEmployee = ?";
  con.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
})

router.put('/edit_employee/:idEmployee', (req, res) => {
  const id = req.params.idEmployee;
  const sql = `UPDATE employee
   set name= ?, email= ?, idCategory= ? 
   WHERE idEmployee= ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.idCategory
  ]
  con.query(sql,[...values, id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})

router.delete('/delete_employee/:idEmployee', (req, res) => {
  const id = req.params.idEmployee;
  const sql = "DELETE FROM employee WHERE idEmployee = ?"
  con.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})
// PROJECTS
// This show all status
router.get('/status', (req, res) => {
  const sql = "SELECT * FROM statusproject";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
})

//This add a project
router.post('/add_project', (req, res) => {
  const sql = `INSERT INTO project
  (nameProject, descriptionProject, idStatus)
  VALUES (?)`;
  const values = [
    req.body.nameProject,
    req.body.descriptionProject,
    req.body.idStatus
  ]
  con.query(sql, [values], (err, result) => {
    if(err) return res.json({Status: false, Error: err})
    return res.json({Status: true})
  })
})

//This show all projects
router.get('/project', (req, res) => {
  const sql = "SELECT * FROM project";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error:"Query Error"})
    return res.json({Status: true, Result: result})
  })
})

router.get('/project/:idProject', (req,res) => {
  const idProject = req.params.idProject;
  const sql = "SELECT * FROM project WHERE idProject = ?";
  con.query(sql, [id], (err, result) => {
    if(err) return res.json({Status:false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
})

//This show all tests
router.get('/test/:idProject', (req, res) => {
  const idProject = req.params.idProject;
  const sql = "SELECT * FROM test WHERE idProject = ?";
  con.query(sql, [idProject], (err, result) => {
    if(err) return res.json({Status: false, Error:"Query Error"})
    return res.json({Status: true, Result: result})
  })
})

//Add Tests
router.post('/add_test', (req, res) => {
  const sql = `INSERT INTO test
  (nameTest, description, idProject, idEmployee)
  VALUES (?)`;
  const values = [
    req.body.nameTest,
    req.body.description,
    req.body.idProject,
    req.body.idEmployee
  ]
  con.query(sql, [values], (err, result) => {
    if(err) return res.json({Status: false, Error: err})
    return res.json({Status: true})
  })
})

router.get('/project_count', (req,res) => {
  const sql = "SELECT count(idProject) AS project FROM project";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})

router.get('/admin_count', (req,res) => {
  const sql = "SELECT count(id) AS admin FROM admin";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})

router.get('/employee_count', (req,res) => {
  const sql = "SELECT count(idEmployee) AS employee FROM employee";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})

router.get('/category_count', (req,res) => {
  const sql = "SELECT count(id) AS category FROM category";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
})

router.get('/logout', (req, res) => {
  res.clearCookie('token')
  return res.json({Status: true})
})
export { router as adminRouter };
