import { now } from "mongoose";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookingCallSchema = new Schema({
  owner: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  call_link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    default: now,
    required: true,
  },
  to: {
    type: Date,
    default: now,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const BookingCall = mongoose.model("bookingCall", BookingCallSchema);
export default BookingCall;
