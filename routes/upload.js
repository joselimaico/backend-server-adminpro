var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');
var app = express();


var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

//middleware
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //validar los tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no valida',
            errors: { message: 'tipo de coleccion no valida' }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No se selecciono ningun archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }
    //obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //se aceptan solo estas extensiones validas
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif', 'JPG'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: { message: 'las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    //nombre archivo personalizado
    //1231324631-123.png

    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });


});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el usuario no existe',
                    errors: { message: 'usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':V';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el medico no existe',
                    errors: { message: 'medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de medico actualizada',
                    usuario: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el hospital no existe',
                    errors: { message: 'hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });
            });
        });


    }
}

module.exports = app;