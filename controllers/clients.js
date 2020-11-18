const e = require('express');
const express = require('express');
const clientModel = require.main.require('./models/clientModel');
const noteModel = require.main.require('./models/noteModel');
const appointmentModel = require.main.require('./models/appointmentModel');
const router = express.Router();
router.get('/', (req, res) => {
    if (req.session.email == null || req.session.email.length < 2) {
        res.redirect('/manager/login');
    } else {
        clientModel.getAll(function (result) {
            res.render('manager/clients/index', {
                users: result,
                full_name: req.session.full_name
            });
        });
    }
});
router.post('/add', (req, res) => {
    var client = {};
    client.full_name = req.body.full_name;
    client.email = req.body.email;
    client.phone = req.body.phone;
    client.address = req.body.address;
    client.city = req.body.city;
    client.country = req.body.country;
    client.website = req.body.website;
    client.billing_city = req.body.billing_city;
    client.billing_state = req.body.billing_state;
    client.billing_zip = req.body.billing_zip;
    client.billing_country = req.body.billing_country;
    client.password = req.body.password;
    client.added_by = req.session.email;
    client.adding_date = Date.now();
    client.status = 'Active';

    clientModel.getByEmail(client.email, function (result) {
        if (result.length > 0) {
            res.redirect('/clients');
        } else {
            clientModel.insert(client, function (status) {
                if (status == true) {
                    clientModel.getByEmail(client.email, function (result) {
                        res.redirect('/clients/profile/' + result[0].id);
                    })
                } else {
                    res.redirect('/clients')
                }
            });
        }
    });
});
router.get('/profile/:id', (req, res) => {
    if(req.session.email == null || req.session.email.length < 2){
        res.redirect('/manager/login');
    }   
    else{
        clientModel.getById(req.params.id, function (result) {
            if (result.length > 0) {
                res.render('manager/clients/profile', {
                    user: result,
                    full_name: req.session.full_name
                });
            } else {
                res.redirect('/clients');
            }
        });
    }
});

router.get('/profile/edit/:id', (req, res) => {
    if(req.session.email == null || req.session.email.length < 2){
        res.redirect('/manager/login');
    }else{
        clientModel.getById(req.params.id, function (result) {
            if (result.length > 0) {
                res.render('manager/clients/profile_edit', {
                    user: result,
                    full_name: req.session.full_name
                });
            } else {
                res.redirect('/clients/profile');
            }
        });
    } 
});
router.post('/profile/edit/:id', (req, res) => {
    if(req.session.email == null || req.session.email.length < 2){
        res.redirect('/manager/login');
    }else{
        var sql = "UPDATE `clients` SET `full_name`='" + req.body.full_name + "',`email`='" + req.body.email + "',`phone`='" + req.body.phone + "',`address`='" + req.body.address + "',`city`='" + req.body.city + "',`country`='" + req.body.country + "',`website`='" + req.body.website + "', `status`='" + req.body.status + "',`billing_city`='" + req.body.billing_city + "',`billing_state`='" + req.body.billing_state + "',`billing_country`='" + req.body.billing_country + "',`billing_zip`='" + req.body.billing_zip + "' WHERE id='" + req.params.id + "'";
        clientModel.update(sql, function (status) {
            if (status == true) {
                res.redirect('/clients/profile/' + req.params.id);
            } else {
                res.redirect('/clients/profile/edit/' + req.params.id);
            }
        });
    }
})
router.post('/profile/delete/:id', function (req, res) {
    if(req.session.email == null || req.session.email.length < 2){
        res.redirect('/manager/login');
    }else{
        clientModel.delete(req.params.id, function (status) {
            if (status == true) {
                res.redirect('/clients');
            } else {
                res.redirect('/clients/profile/' + req.params.id);
            }
        });
    }
})
router.get('/profile/:id/calls', (req, res) => {
    res.render('manager/clients/calls');
});
router.get('/profile/:id/appointments', (req, res) => {
    if(req.session.email==null){
        res.redirect('/manager/login');
    }
    else{
        appointmentModel.getById(req.params.id, function (allAppointments) {
            clientModel.getById(req.params.id, function(result){
                res.render('manager/clients/appointments', {
                    user: result,
                    allNotes: allAppointments,
                    full_name: req.session.full_name
                });
            });
        });
    }
});
router.get('/profile/:user_id/appointments/delete/:id', function(req, res){
    appointmentModel.delete(req.params.id, function(status){
        if(status==true){
            res.redirect('/clients/profile/'+req.params.user_id+'/appointments');
        }else{
            res.send('Could not delete the note');
        }
    })
});
router.post('/profile/:id/appointments', (req, res) => {
    if (req.session.email == null || req.session.email.length < 2) {
        res.redirect('/manager/login');
    }else{
        if(req.session.user_id==null){
            res.redirect('/manager/login');
        }
        else{
            var appointment = {};
            appointment.title = req.body.title;
            appointment.body = req.body.body;
            appointment.creation_date = req.body.date;
            appointment.appointment_date = req.body.appointment_date;
            appointment.clients_id = req.params.id;
            appointment.manager_id = req.session.user_id;
            console.log(appointment);
            appointmentModel.insert(appointment,function(status){
                if(status == true){
                    res.redirect('/clients/profile/'+req.params.id+'/appointments');
                }
                else{
                    res.redirect('/clients/profile/'+req.params.id+'/appointments');
                }
            });
        }
    }
});
router.get('/profile/:id/notes', (req, res) => {
    if(req.session.email == null || req.session.email.length < 2){
        res.redirect('/manager/login');
    }else{
        noteModel.getById(req.params.id, function (allNotes) {
            clientModel.getById(req.params.id, function(result){
                res.render('manager/clients/notes', {
                    user: result,
                    allNotes: allNotes,
                    full_name: req.session.full_name
                });
            });
        });
    }
});
router.post('/profile/:id/notes', (req, res) => {
    if (req.session.email == null || req.session.email.length < 2) {
        res.redirect('/manager/login');
    }else{
        if(req.session.user_id==null){
            res.redirect('/manager/login');
        }
        else{
            var note = {};
            note.title = req.body.title;
            note.body = req.body.body;
            note.date = req.body.date;
            note.client_id = req.params.id;
            note.manager_id = req.session.user_id;
            noteModel.insert(note,function(status){
                if(status == true){
                    res.redirect('/clients/profile/'+req.params.id+'/notes');
                }
                else{
                    res.redirect('/clients/profile/'+req.params.id+'/notes');
                }
            });
        }
    }
});
router.get('/profile/:user_id/notes/delete/:id', function(req, res){
    noteModel.delete(req.params.id, function(status){
        if(status==true){
            res.redirect('/clients/profile/'+req.params.user_id+'/notes');
        }else{
            res.send('Could not delete the note');
        }
    })
});
router.post('/profile/:user_id/notes/edit/:id', function(req, res){
    if(req.session.email==null){
        res.redirect('/manager/login');
    }
    else{
        note = {};
        note.id = req.params.id;
        note.body =  req.body.body;
        note.title = req.body.title;
        note.date = req.body.date;
        note.client_id = req.params.user_id;
        note.manager_id = req.session.user_id;
        noteModel.update(note, function(status){
            if(status==true){
                res.redirect('/clients/profile/'+req.params.user_id+'/notes');
            }
            else{
                res.redirect('/clients/profile/'+req.params.user_id+'/notes');
            }
        });
    }
});
router.get('/profile/:id/proposals', (req, res) => {
    if (req.session.email == null || req.session.email.length < 2) {
        res.redirect('/manager/login');
    }else{
        res.render('manager/clients/proposals');
    }
});
router.get('/profile/:id/chat', (req, res) => {
    if (req.session.email == null || req.session.email.length < 2) {
        res.redirect('/manager/login');
    }else{
        res.render('manager/clients/chat');
    }
});
module.exports = router;