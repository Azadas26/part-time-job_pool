const twilio = require("twilio");
var promise = require("promise");

module.exports = {
  Generate_Otp: (ph) => {
    return new promise(async (resolve, reject) => {
      console.log(ph);
      const accountSid = "ACa1d81e63091611cf838cdcb3e2585521";

      const authToken = "ed98fe243992d1400a56253f2fdadd34";

      const twilioPhoneNumber = "+12409492550";

      function generateOTP() {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      }

      // Function to send OTP via SMS
      function sendOTPSMS(phoneNumber, otp) {
        const client = twilio(accountSid, authToken);

        client.messages
          .create({
            body: `Your OTP is: ${otp} this otp valid only for 10 min please enter correct otp
thankyou and grateday..`,
            from: twilioPhoneNumber,
            to: phoneNumber,
          })
          .then((message) => console.log(`OTP sent: ${message.sid}`))
          .catch((error) =>
            console.error(`Failed to send OTP: ${error.message}`)
          );
      }

      // Usage example
      const phoneNumber = "+91" + ph; // Replace with the recipient's phone number
      const otp = generateOTP();
      resolve(otp);

      await sendOTPSMS(phoneNumber, otp);
    });
  },
};
