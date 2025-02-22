$("#payment").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/payment',
        method: 'post',
        data: $('#payment').serialize(),
        success: (response) => {
            //alert(response)
            razorpayPayment(response)

        }
    })
})


function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_NVSZaOyVAMHDJW", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Task_Horizon",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the previous step
        "handler": function (response) {


            verfyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}


function verfyPayment(payment, order) {

    $.ajax({
        url: '/verfy-pay',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {

            if (response.status) {
                location.href = '/afterplaced'
            }
            else {
                alert("Payment Faild...")
            }
        }


    })
}
