import Notification from "../models/notification.model.js";


export const getNotifications = async (req,res) =>{
    try {
        /* we are going to get notifications for the currently logged in user so we are
            getting the user id from the protectroute middleware */

        const userId = req.user._id;

        /*to know from whom we are getting the notification we are going to see the 'to' field
          in the notification model which has this userId from that we can extract the 'from' field*/

        const notification = await Notification.find({to: userId})
                                   .populate({
			                          path: "from",
			                          select: "username profileImg",
		                            });

        /* if they call this notification route it is meant that all the notification are shown to
           them,so we are making the read field to tru */
           
        await Notification.updateMany({to:userId},{read:true})

        res.status(200).json(notification)

    } catch (error) {
        console.log("Error in getNotifications controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteNotifications = async (req,res) =>{
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to : userId})

        res.status(200).json({message:"notificaions deleted successfully"})
    } catch (error) {
        console.log("Error in deleteNotifications controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}