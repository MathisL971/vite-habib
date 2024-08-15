const odbc = require('odbc');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const connectionConfig = {
    connectionString: `DSN=${process.env.DSN}`,
    connectionTimeout: 10,
    loginTimeout: 10,
}

app.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        odbc.connect(connectionConfig, (error, connection) => {
            if (error) {
                throw error;
            }

            connection.query(`SELECT * FROM USER WHERE email = '${email}'`, (error, result) => {
                if (error) { 
                    throw error;
                }
                 
                if (result.count === 0 || result[0].PASSWORD !== password) {
                    return res.status(401).json({
                        error: 'utilisateur ou mot de passe incorrect',
                    })
                }

                const user = result[0];

                const token = jwt.sign({ 
                    email: user.Email,
                    id: user.ID,
                }, process.env.JWT_SECRET, { expiresIn: '1h' });
                
                res.status(200).cookie('token', token, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600000,
                })

                res.json({
                    "message": "Utilisateur connecté",
                });
            });
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
