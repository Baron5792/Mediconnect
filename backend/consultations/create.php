<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    require_once __DIR__ . '/../config/required.php';
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../config/email.php';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
    }
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'doctor') {
        http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
    }
    $user = $_SESSION['user'];

    $data          = json_decode(file_get_contents('php://input'), true) ?? [];
    $appointmentId = (int)($data['appointment_id'] ?? 0);
    $diagnosis     = $data['diagnosis'] ?? null;
    $prescription  = $data['prescription'] ?? null;
    $notes         = $data['notes'] ?? null;
    $recommendations = $data['recommendations'] ?? null;

    if (!$appointmentId) {
        http_response_code(400); echo json_encode(['status'=>'error','message'=>'appointment_id is required']); exit();
    }

    $appt = $connection->prepare("
        SELECT
            a.*,
            p.full_name AS patient_name,
            p.email AS patient_email,
            d.full_name AS doctor_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users d ON a.doctor_id = d.id
        WHERE a.id = ? AND a.doctor_id = ?
    ");
    $appt->bind_param('ii', $appointmentId, $user['id']);
    $appt->execute();
    $r = $appt->get_result(); $appointment = $r->fetch_assoc(); 
    $patientId = $appointment['patient_id'] ?? null;
    $r->free(); 
    $appt->close();

    if (!$appointment) {
        http_response_code(404); echo json_encode(['status'=>'error','message'=>'Appointment not found']); exit();
    }

    $stmt = $connection->prepare(
        'INSERT INTO consultations (appointment_id, doctor_id, patient_id, diagnosis, prescription, notes, recommendations) VALUES (?,?,?,?,?,?,?)'
    );
    $stmt->bind_param('iiissss', $appointmentId, $user['id'], $appointment['patient_id'], $diagnosis, $prescription, $notes, $recommendations);

    if (!$stmt->execute()) {
        http_response_code(400);
        echo json_encode(['status'=>'error','message'=>'Failed to create consultation', 'error'=>$stmt->error]);
        exit();
    }

    $newId = (int) $connection->insert_id;

    // Mark appointment as completed
    $upd = $connection->prepare("UPDATE appointments SET status='completed' WHERE id=?");
    $upd->bind_param('i', $appointmentId);
    $upd->execute();

    /**
     * Update in the medical records
     */

    $title       = "Consultation - " . date('Y-m-d');
    $recordType  = "diagnosis";
    $treatment   = $recommendations ?: null;
    $filePath    = null;

    $medical = $connection->prepare("
        INSERT INTO medical_records (
            patient_id,
            doctor_id,
            title,
            record_type,
            diagnosis,
            treatment,
            prescriptions,
            notes,
            file_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$medical) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $connection->error
        ]);
        exit();
    }

    $medical->bind_param(
        "iisssssss",
        $patientId,
        $user['id'],
        $title,
        $recordType,
        $diagnosis,
        $treatment,
        $prescription,
        $notes,
        $filePath
    );

    if (!$medical->execute()) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create medical record",
            "error" => $medical->error
        ]);
        exit();
    }

    $medical->close();

    // ===============================
    // Send consultation completion email
    // ===============================

    $subject = "Consultation Completed";

    $body = "
        <p>Dear <strong>{$appointment['patient_name']}</strong>,</p>

        <p>Your consultation has been successfully completed.</p>

        <p>Your doctor has provided the following information:</p>

        <table style='width:100%;border-collapse:collapse'>
        <tr>
            <td style='padding:8px;border:1px solid #ddd;'><strong>Doctor</strong></td>
            <td style='padding:8px;border:1px solid #ddd;'>{$appointment['doctor_name']}</td>
        </tr>

        <tr>
            <td style='padding:8px;border:1px solid #ddd;'><strong>Diagnosis</strong></td>
            <td style='padding:8px;border:1px solid #ddd;'>
                " . (!empty($diagnosis) ? nl2br(htmlspecialchars($diagnosis)) : 'N/A') . "
            </td>
        </tr>

        <tr>
            <td style='padding:8px;border:1px solid #ddd;'><strong>Prescription</strong></td>
            <td style='padding:8px;border:1px solid #ddd;'>
                " . (!empty($prescription) ? nl2br(htmlspecialchars($prescription)) : 'None') . "
            </td>
        </tr>

        <tr>
            <td style='padding:8px;border:1px solid #ddd;'><strong>Recommendations</strong></td>
            <td style='padding:8px;border:1px solid #ddd;'>
                " . (!empty($recommendations) ? nl2br(htmlspecialchars($recommendations)) : 'None') . "
            </td>
        </tr>
        </table>

        <p style='margin-top:20px'>
        If you have any questions regarding your treatment, kindly contact your doctor through the Mediconnect platform.
        </p>

        <p>Thank you for choosing <strong>Mediconnect</strong>.</p>
    ";

    sendEmail(
        $appointment['patient_email'],
        $appointment['patient_name'],
        $subject,
        $body
    );

    http_response_code(201);
    echo json_encode(['status'=>'success','message'=>'Consultation created','data'=>['id'=>$newId]]);
    exit();
