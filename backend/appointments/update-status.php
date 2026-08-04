<?php
    require_once __DIR__ . '/../config/required.php';
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . "/../config/email.php";

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
    }
    if (empty($_SESSION['user'])) {
        http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
    }
    $user = $_SESSION['user'];

    $id   = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $status = $data['status'] ?? '';

    if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Appointment ID is required']); exit(); }

    $allowed = ['pending','confirmed','completed','cancelled','rejected'];
    if (!in_array($status, $allowed)) {
        http_response_code(400); echo json_encode(['status'=>'error','message'=>'Invalid status']); exit();
    }

    $stmt = $connection->prepare('SELECT * FROM appointments WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $r = $stmt->get_result(); $appt = $r->fetch_assoc(); $r->free(); $stmt->close();

    if (!$appt) { http_response_code(404); echo json_encode(['status'=>'error','message'=>'Appointment not found']); exit(); }

    // Role-based access
    if ($user['role'] === 'patient' && $appt['patient_id'] !== $user['id']) {
        http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
    }
    if ($user['role'] === 'doctor' && $appt['doctor_id'] !== $user['id']) {
        http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
    }

    $notes            = $data['notes'] ?? null;
    $cancelledReason  = $data['cancelled_reason'] ?? null;

    $stmt2 = $connection->prepare(
        'UPDATE appointments SET status=?, notes=?, cancelled_reason=? WHERE id=?'
    );
    $stmt2->bind_param('sssi', $status, $notes, $cancelledReason, $id);

    if (!$stmt2->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => "Unable to update appointment"]);
        exit();
    }
    $stmt2->close();

    if ($status === 'confirmed') {

        $stmt = $connection->prepare("
            SELECT
                p.full_name,
                p.email,
                a.appointment_date,
                a.appointment_time,
                d.full_name AS doctor_name
            FROM appointments a
            JOIN users p ON a.patient_id = p.id
            JOIN users d ON a.doctor_id = d.id
            WHERE a.id = ?
        ");

        $stmt->bind_param("i", $id);
        $stmt->execute();

        $patient = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($patient) {

            $date = date(
                "l, F j, Y",
                strtotime($patient['appointment_date'])
            );

            $time = date(
                "g:i A",
                strtotime($patient['appointment_time'])
            );

            $subject = "Appointment Confirmed";

            $body = "
                <p>Dear <strong>{$patient['full_name']}</strong>,</p>

                <p>Your appointment request has been <strong>accepted</strong>.</p>

                <p><strong>Appointment Details</strong></p>

                <ul>
                    <li><strong>Doctor:</strong> {$patient['doctor_name']}</li>
                    <li><strong>Date:</strong> {$date}</li>
                    <li><strong>Time:</strong> {$time}</li>
                </ul>

                <p>Please arrive at least <strong>15 minutes early</strong>.</p>

                <p>If you can no longer attend, kindly cancel the appointment through the Mediconnect portal.</p>

                <p>Thank you.</p>
            ";

            sendEmail(
                $patient['email'],
                $patient['full_name'],
                $subject,
                $body
            );
        }
    }

    echo json_encode(['status'=>'success','message'=>'Appointment status updated','data'=>null]);
    exit();
