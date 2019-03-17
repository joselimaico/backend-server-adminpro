var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;



//=================================
//verificar token
//==================================

exports.verificarToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
}

//=================================
//verificar admin
//==================================

exports.verificarAdmin = function(req, res, next) {
        var usuario = req.usuario;

        if (usuario.role === 'ADMIN_ROLE') {
            next();
            return;
        } else {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: { message: 'No es administrador' }
            });
        }

    }
    //=================================
    //verificar admin o mismo usuario
    //==================================

exports.verificarAdminUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'No es administrador ni es el mismo usuario' }
        });
    }

}