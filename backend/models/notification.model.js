import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["follow", "like"], // notification is sent if followed or liked
		},
		read: {
			type: Boolean,
			default: false,  // it will become true only if notificaton is sent
		},
	},
	{ timestamps: true }
);


const Notification = mongoose.model("Notification",notificationSchema)
export default Notification