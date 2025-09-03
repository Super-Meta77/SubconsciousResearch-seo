<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Include PHPMailer classes
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Check if required checkboxes are checked
    if (!isset($_POST['accept_policy']) || !isset($_POST['consent_sms'])) {
        echo "Error: You must accept the policy and give SMS consent.";
        exit;
    }

    $mail = new PHPMailer(true);
    try {
        // SMTP settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'mykidsabcmusic@gmail.com'; // your Gmail
        $mail->Password = 'qpia pfyh sajn mgwh';      // App Password from Google
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Email headers
        $mail->setFrom('mykidsabcmusic@gmail.com', 'Website Form');
        $mail->addAddress('mykidsabcmusic@gmail.com'); // send to yourself

        // Email content
        $mail->isHTML(false);
        $mail->Subject = 'New Form Submission';
        $mail->Body = "
First Name: {$_POST['first_name']}
Last Name: {$_POST['last_name']}
Email: {$_POST['email']}
Phone: {$_POST['phone']}
Accept Policy: Yes
Consent SMS: Yes";

        $mail->send();
        echo "Message sent successfully!";
    } catch (Exception $e) {
        echo "Mailer Error: " . $mail->ErrorInfo;
    }
}
?>
