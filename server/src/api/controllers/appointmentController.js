const { validationResult, Result, body } = require("express-validator");
const res = require("express/lib/response");
const Appointment = require("./../models/appointmentModel");
const Payment = require("./../models/paymentModel");
// ----------------------- Get All Apointments -------------
exports.listappointments = function (request, response, next) {
  Appointment.find({})
    .populate("bill")
    .populate("patient")
    .populate({path: "doctor", populate: {
      path: "_id"
      }})
    .exec()
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((error) => {
      error.status = 500;
      next(error);
    });
};

// ------------------Get Appointment by Id ---------------------
exports.getappointment = function (request, response) {
  Appointment.findOne({ _id: request.params.id })
    .populate("bill")
    .populate("patient")
    .populate("doctor")
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((error) => {
      error.status = 500;
      next(error);
    });
};

//------ Adding Appointment ------------
exports.addappointment = async function (request, response, next) {
  let errors = validationResult(request);
  console.log(errors);
  if (!errors.isEmpty()) {
    let error = new Error();
    error.status = 422;
    error.message = errors
      .array()
      .reduce((current, object) => current + object.msg + "", "");
    next(error);
  } else {
    let c = await Payment.exists({ _id: request.body.bill });

    if (!c && request.body.bill != null) {
      let error = new Error();
      error.status = 404;
      error.message = "Bill not found";
      next(error);
    } else {
      let appointmentObject = new Appointment({
        //_id: request.body.id,
        time: request.body.time,
        bill: request.body.bill,
        patient: request.body.patient,
        doctor: request.body.doctor,
        condition: request.body.condition,
      });

      appointmentObject
        .save()
        .then((object) => {
          response.status(201).json(object);
        })
        .catch((error) => {
          error.status = 500;
          res.json({ message: "No appointments available on taht time" });
          next(error);
        });
    }
  }
};

// ------------------ Update ِAppontment ---------------------
exports.updateappointment = async function (request, response, next) {
  let c = await Payment.exists({ _id: request.body.bill });

  if (!c && request.body.bill != null) {
    let error = new Error();
    error.status = 404;
    error.message = "Bill not found";
    next(error);
  } else {
    Appointment.updateOne(
      { _id: request.params.id },
      {
        $set: {
          time: request.body.time,
          bill: request.body.bill,
          patient: request.body.patient,
          doctor: request.body.doctor,
          condition: request.body.condition,
        },
      }
    )
      .then((object) => {
        response.status(201).json(object);
      })
      .catch((error) => {
        error.status = 500;
        next(error);
      });
  }
};

// -------- delete Appointment ------------
exports.deleteappointment = function (request, response, next) {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    let error = new Error();
    error.status = 422;
    error.message = errors
      .array()
      .reduce((current, object) => current + object.msg + "", "");
    next(error);
  } else {
    Appointment.deleteOne({ _id: request.params.id })
      .then((result) => {
        response.status(201).json({ message: "Appointment Deleted" });
      })
      .catch((error) => {
        error.status = 500;
        next(error);
      });
  }
};
