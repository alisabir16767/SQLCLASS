const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Update views directory path

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Sabirali@123'
});

// Get a connection from the pool
async function getConnection() {
    try {
        const connection = await pool.promise().getConnection();
        return connection;
    } catch (err) {
        throw err;
    }
}

app.get("/", async (req, res) => {
    try {
        const connection = await getConnection();

        // Perform SELECT query to fetch all user data
        const [rows, fields] = await connection.query("SELECT * FROM user");

        // Print user data on the console in object form
        console.log("Users Data:");
        console.log(rows[0].username);
        console.log(rows[0]);
        let count = rows.length;
        // Send the home page of users as a response
        res.render("home",{count}); // Update to render "home.ejs"

        // Release the connection back to the pool
        connection.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/user", async (req, res) => {
    try {
        const connection = await getConnection();

        // Perform SELECT query to fetch all user data
        const [rows, fields] = await connection.query("SELECT * FROM user");

        // Render the user.ejs template and pass the 'rows' array as a local variable
        res.render("user", { rows }); // Pass 'rows' to the template

        // Release the connection back to the pool
        connection.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/user/:id/edit", async (req, res) => {
    try {
        const connection = await getConnection();
        const { id } = req.params;
        
        // Perform SELECT query to fetch user data by ID
        const [rows, fields] = await connection.query(`SELECT * FROM user WHERE id = ?`, [id]);
        console.log(rows[0]);

        let user = rows[0];
        
        // Render the edit.ejs template and pass the 'rows' array as a local variable
        res.render("edit", { user }); // Pass 'user' object to the template

        // Release the connection back to the pool
        connection.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


//update route
//update route
app.patch("/user/:id", async (req, res) => {
    let connection; // Define connection variable here

    try {
        connection = await getConnection();
        const { id } = req.params;
        const { username, email, password } = req.body;

        // Check if the user exists
        const [user] = await connection.query("SELECT * FROM user WHERE id = ?", [id]);
        if (!user || user.length === 0) {
            return res.status(404).send("User not found");
        }

        // Construct an object containing only the fields that were provided in the request body
        const updatedUserData = {};
        if (username) {
            updatedUserData.username = username;
        }
        if (email) {
            updatedUserData.email = email;
        }
        if (password) {
            updatedUserData.password = password;
        }

        if (Object.keys(updatedUserData).length === 0) {
            return res.status(400).send("No fields provided for update");
        }

        // Perform UPDATE query to update user data
        const [result] = await connection.query("UPDATE user SET ? WHERE id = ?", [updatedUserData, id]);

        // Check if the update was successful
        if (result.affectedRows === 1) {
            // Redirect to user profile page after successful update
            return res.redirect(`/user`);
        } else {
            return res.status(500).send("Failed to update user");
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
});




app.listen(8080, () => { // Update port without quotes
    console.log("Server is listening on port 8080");
});
