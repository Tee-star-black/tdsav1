<?php
declare(strict_types=1);

/**
 * TeleDoctorSA website enquiries (PHP 8.1+ / cPanel).
 * Do not accept clinical records or attachments at this endpoint.
 * Configure TDS_LEADS_TO and TDS_LEADS_FROM in the hosting environment as needed.
 */
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

function tds_respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    tds_respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($length > 16000) {
    tds_respond(413, ['ok' => false, 'error' => 'The request is too large.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $siteHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $siteHost = explode(':', $siteHost)[0];
    if ($host === '' || !in_array($host, [$siteHost, 'teledoctorsa.co.za', 'www.teledoctorsa.co.za'], true)) {
        tds_respond(403, ['ok' => false, 'error' => 'Cross-site enquiries are not accepted.']);
    }
}

$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
$payload = null;
if (strpos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input', false, null, 0, 16001);
    $payload = is_string($raw) ? json_decode($raw, true) : null;
} elseif (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
    $payload = $_POST;
}
if (!is_array($payload)) {
    tds_respond(400, ['ok' => false, 'error' => 'Invalid form data.']);
}

function tds_field(array $payload, string $key, int $max = 300): string {
    $value = $payload[$key] ?? '';
    if (!is_string($value)) return '';
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value));
    if (strlen($value) > $max) return '';
    return $value;
}

if (tds_field($payload, 'website', 300) !== '') {
    tds_respond(400, ['ok' => false, 'error' => 'Invalid enquiry.']);
}

$name = tds_field($payload, 'name', 120);
$email = tds_field($payload, 'email', 254);
$phone = tds_field($payload, 'phone', 32);
$preferredContact = tds_field($payload, 'preferredContact', 32);
$service = tds_field($payload, 'service', 64);
$message = tds_field($payload, 'message', 2000);
$timeframe = tds_field($payload, 'timeframe', 32);
$leadSource = tds_field($payload, 'leadSource', 70);
$leadIntent = tds_field($payload, 'leadIntent', 70);
$role = tds_field($payload, 'role', 32);
$demoType = tds_field($payload, 'demoType', 40);
$organization = tds_field($payload, 'organization', 120);

$allowedServices = ['app-access', 'virtual-consultation', 'ecg247-monitoring', 'records-access', 'general-guidance', 'app-demo'];
$allowedChannels = ['phone', 'whatsapp', 'email'];
$allowedTimeframes = ['', 'asap', 'this-week', 'this-month', 'researching'];
$allowedRoles = ['', 'patient', 'practitioner', 'practice', 'organisation', 'partner', 'other'];
$allowedDemos = ['', 'patient-app', 'clinician-platform', 'connected-care', 'full-platform'];
$digits = preg_replace('/\D+/', '', $phone);

if (
    strlen($name) < 2 ||
    filter_var($email, FILTER_VALIDATE_EMAIL) === false ||
    strlen($email) > 254 ||
    strlen($digits) < 7 || strlen($digits) > 18 ||
    !preg_match('/^[+0-9().\s-]+$/D', $phone) ||
    !in_array($preferredContact, $allowedChannels, true) ||
    !in_array($service, $allowedServices, true) ||
    !in_array($timeframe, $allowedTimeframes, true) ||
    !in_array($role, $allowedRoles, true) ||
    !in_array($demoType, $allowedDemos, true) ||
    !in_array($payload['consent'] ?? null, [true, 'on', '1', 1], true)
) {
    tds_respond(422, ['ok' => false, 'error' => 'Please check the required fields and consent.']);
}
if ($leadSource === 'app-demo-page' && ($role === '' || $demoType === '')) {
    tds_respond(422, ['ok' => false, 'error' => 'Please select your role and the demo you would like to see.']);
}

if (!preg_match('/^[a-z0-9-]{0,70}$/D', $leadSource) || !preg_match('/^[a-z0-9-]{0,70}$/D', $leadIntent)) {
    tds_respond(422, ['ok' => false, 'error' => 'Invalid enquiry source.']);
}

// Lightweight per-IP throttle in private system temp storage; no submitted contact details stored there.
$clientIp = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$throttleFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'tdsa-leads-' . hash('sha256', $clientIp);
$handle = @fopen($throttleFile, 'c+');
if ($handle !== false) {
    if (@flock($handle, LOCK_EX)) {
        $existing = stream_get_contents($handle);
        $history = json_decode(is_string($existing) ? $existing : '[]', true);
        if (!is_array($history)) $history = [];
        $now = time();
        $history = array_values(array_filter($history, static function ($time) use ($now) {
            return is_numeric($time) && (int) $time > $now - 1800;
        }));
        if (count($history) >= 5) {
            @flock($handle, LOCK_UN);
            fclose($handle);
            tds_respond(429, ['ok' => false, 'error' => 'Too many enquiries. Please try again later or contact us on WhatsApp.']);
        }
        // Reserve the attempt to prevent mail abuse, regardless of email transport outcome.
        $history[] = $now;
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($history));
        fflush($handle);
        @flock($handle, LOCK_UN);
    }
    fclose($handle);
}

$recipient = getenv('TDS_LEADS_TO') ?: 'info@teledoctorsa.co.za';
$sender = getenv('TDS_LEADS_FROM') ?: 'info@teledoctorsa.co.za';
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL)) {
    error_log('TDSA leads: invalid configured mailbox.');
    tds_respond(503, ['ok' => false, 'error' => 'Demo requests are temporarily unavailable. Please use WhatsApp.']);
}

$reference = 'TDS-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
$tracked = isset($payload['tracking']) && is_array($payload['tracking']) ? $payload['tracking'] : [];
$utm = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign'] as $key) {
    $utm[] = $key . ': ' . tds_field($tracked, $key, 100);
}

$body = implode("\n", [
    'New TeleDoctorSA website enquiry',
    'Reference: ' . $reference,
    'Received: ' . (new DateTimeImmutable('now', new DateTimeZone('Africa/Johannesburg')))->format('Y-m-d H:i:s T'),
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Phone: ' . $phone,
    'Preferred contact: ' . $preferredContact,
    'Organisation: ' . $organization,
    'Role: ' . $role,
    'Requested demo: ' . $demoType,
    'Service: ' . $service,
    'Timeframe: ' . $timeframe,
    'Message: ' . $message,
    '',
    'Source: ' . $leadSource,
    'Intent: ' . $leadIntent,
    'Page: ' . tds_field($payload, 'pageUrl', 600),
    'Referrer: ' . tds_field($payload, 'referrer', 600),
    implode("\n", $utm),
    '',
    'Consent: Yes, to responding about this enquiry.',
    'Please do not reply with medical information through this website enquiry channel.'
]);
$headers = implode("\r\n", [
    'From: TeleDoctorSA Website <' . $sender . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: TeleDoctorSA-Web-Leads'
]);
$subject = '[TeleDoctorSA] ' . ($leadIntent === 'guided-demo' ? 'App demo request' : 'Website enquiry') . ' ' . $reference;

try {
    $sent = @mail($recipient, $subject, $body, $headers);
} catch (Throwable $error) {
    $sent = false;
}
if (!$sent) {
    error_log('TDSA website lead email not accepted by mail transport: ' . $reference);
    tds_respond(503, ['ok' => false, 'error' => 'We could not send your request. Please contact us on WhatsApp or email.']);
}

tds_respond(200, [
    'ok' => true,
    'leadId' => $reference,
    'responseWindow' => 'within one business day',
    'nextStep' => 'Our team will follow up using your preferred contact method.'
]);
