const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = 3000;

//Inicia el servidor
app.listen(port, (err)=>{
    //Verificar si hay error
    if(err){
        return console.error('Error al iniciar el servidor', err)
    }
    //Si no hay error
    console.log('Servidor escuchando en el puerto ${port}')
})

// Define la URL de conexión
const mongoUri = 'mongodb+srv://ecojustas:Ecojustas123.*@cluster0.nniypv8.mongodb.net/ecoDB';

mongoose.connect(mongoUri)
.then(()=>{
    console.log('Conectado a MongoDB Atlas')
})
.catch( err=>{
    console.error('Error al conectar con MongoDB Atlas', err)
})