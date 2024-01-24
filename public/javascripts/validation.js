$(document).ready(() => {
    // Add a custom validation method for the name field
    $.validator.addMethod(
      "startsWithLetter",
      function (value, element) {
        return this.optional(element) || /^[A-Za-z]/.test(value);
      },
      "Name must start with a letter."
    );
  
    // Initialize the validation for your form
    $("#usersignupform").validate({
      rules: {
        name: {
          required: true,
          startsWithLetter: true, // Use the custom validation method
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
        ph: {
          required: true,
          minlength: 10,
          maxlength: 10,
        },
        otp:
        {
          required : true
        },
        aadhar: {
          required: true,
          minlength: 12,
          maxlength: 12,
        },
        address: {
          required: true,
        },
        image: {
          required: true,
          accept: "image/*", // Allow only image files
      },
      },
      messages: {
        image: {
            accept: "Please upload a valid image file.",
        },
    },
    });
    $("#wksignupform").validate({
      rules: {
        name: {
          required: true,
          startsWithLetter: true, // Use the custom validation method
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
        ph: {
          required: true,
          minlength: 10,
          maxlength: 10,
        },
        image: {
          required: true,
        },
      },
    });
  });
  