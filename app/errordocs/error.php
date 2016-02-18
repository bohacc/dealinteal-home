<?php
 $server_name = $_SERVER["HTTP_HOST"];
 $server_page = $_SERVER["REQUEST_URI"];
 $page_url = 'http://' . $server_name . $server_page;
 $visitor_ip = $_SERVER["REMOTE_ADDR"];
 $visitor_host = $_SERVER["REMOTE_HOST"];
 $visitor_browser = $_SERVER['HTTP_USER_AGENT'];
 $visitor_refer = $_SERVER['HTTP_REFERER'];
 $visitor_timestamp = date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']);




$to      = 'webmaster@notia.com';
$subject = 'vps.notia.cz - '.$error_code;
$message = 'URL: '.$page_url . "\r\n" .
    'Error: '.$error_description . "\r\n" .
	'IP: '.$visitor_ip . "\r\n" .
	'Host: '.$visitor_host . "\r\n" .
	'Browser: '.$visitor_browser . "\r\n" .
	'Referer: '.$visitor_refer . "\r\n" .
	'Timestamp: '.$visitor_timestamp;
//echo $message;
$headers = 'From: postmaster@notia.com' . "\r\n" .
    'Reply-To: postmaster@notia.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

if (mail($to, $subject, $message, $headers)) {
   $mail_info = 'Informace o chybě byla úspěšně odeslána správcům webu';
}  else {
    $mail_info = 'Budeme velmi rádi, když uvědomíte našeho <a href="mailto:webmaster@notia.cz">webmastera</a>';
}


$html='
    <?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
    <meta http-equiv="Content-Language" content="cs"/>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Objekt nenalezen</title>
    <style type="text/css" media="screen">
     body {background-color: white; background-image: url("/errordocs/img/background.png"); background-repeat: no-repeat;
           font-family:verdana; font-size:11px; line-height:150%; margin:0; padding:0;}
    </style>
  </head>
  <body>
  <div style="text-align: center;">
    <div style="margin-top: 10px;"><img title="Notia" alt="Notia" src="/errordocs/img/logo.png" /></div>
    <h2>'.$error_code.'</h2>
    <p> Volaná stránka: '.$page_url.'</p>
    <p>'.$error_description.'</p>
    <p>Bude-li se tato chyba vyskytovat trvale, kontaktujte nás prosím telefonicky: +420 274 782 410 nebo e-mailem: <a href="mailto:info@notia.com">info@notia.com</a>.</p>
    <p>'.$mail_info.'</p>
    <p><a href="http://www.notia.com">www.notia.com</a></p>
    <p><a href="http://helpdesk.notia.cz">helpdesk</a></p>
  </div>
  </body>
</html>
';
echo $html;
?>


