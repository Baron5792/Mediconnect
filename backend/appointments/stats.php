<?php

require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

if (empty($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized'
    ]);
    exit();
}

$user = $_SESSION['user'];

try {

    /*
    |--------------------------------------------------------------------------
    | DOCTOR DASHBOARD
    |--------------------------------------------------------------------------
    */
    if ($user['role'] === 'doctor') {

        // Appointment statistics
        $stmt = $connection->prepare("
            SELECT
                COUNT(*) AS total_appointments,
                COUNT(DISTINCT patient_id) AS total_patients,

                SUM(
                    appointment_date = CURDATE()
                    AND status IN ('pending','confirmed')
                ) AS today,

                SUM(
                    appointment_date > CURDATE()
                    AND status IN ('pending','confirmed')
                ) AS upcoming,

                SUM(status='pending') AS pending,
                SUM(status='confirmed') AS confirmed,
                SUM(status='completed') AS completed,
                SUM(status='cancelled') AS cancelled

            FROM appointments
            WHERE doctor_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();

        $result->free();
        $stmt->close();

        // Total consultations
        $stmt = $connection->prepare("
            SELECT COUNT(*)
            FROM consultations
            WHERE doctor_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $stats['total_consultations'] =
            (int)$stmt->get_result()->fetch_row()[0];

        $stmt->close();

        // Total medical records created by doctor
        $stmt = $connection->prepare("
            SELECT COUNT(*)
            FROM medical_records
            WHERE doctor_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $stats['total_records'] =
            (int)$stmt->get_result()->fetch_row()[0];

        $stmt->close();

        foreach ($stats as $key => $value) {
            $stats[$key] = (int)($value ?? 0);
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'OK',
            'data' => $stats
        ]);

        exit();
    }

    /*
    |--------------------------------------------------------------------------
    | PATIENT DASHBOARD
    |--------------------------------------------------------------------------
    */
    if ($user['role'] === 'patient') {

        // Appointment statistics
        $stmt = $connection->prepare("
            SELECT
                COUNT(*) AS total_appointments,

                SUM(
                    appointment_date = CURDATE()
                    AND status IN ('pending','confirmed')
                ) AS today,

                SUM(
                    appointment_date > CURDATE()
                    AND status IN ('pending','confirmed')
                ) AS upcoming,

                SUM(status='pending') AS pending,
                SUM(status='confirmed') AS confirmed,
                SUM(status='completed') AS completed,
                SUM(status='cancelled') AS cancelled

            FROM appointments
            WHERE patient_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();

        $result->free();
        $stmt->close();

        // Total consultations
        $stmt = $connection->prepare("
            SELECT COUNT(*)
            FROM consultations
            WHERE patient_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $stats['total_consultations'] =
            (int)$stmt->get_result()->fetch_row()[0];

        $stmt->close();

        // Total medical records
        $stmt = $connection->prepare("
            SELECT COUNT(*)
            FROM medical_records
            WHERE patient_id = ?
        ");

        $stmt->bind_param('i', $user['id']);
        $stmt->execute();

        $stats['total_records'] =
            (int)$stmt->get_result()->fetch_row()[0];

        $stmt->close();

        foreach ($stats as $key => $value) {
            $stats[$key] = (int)($value ?? 0);
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'OK',
            'data' => $stats
        ]);

        exit();
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN DASHBOARD
    |--------------------------------------------------------------------------
    */

    $stmt = $connection->prepare("
        SELECT
            COUNT(*) AS total_appointments,
            COUNT(DISTINCT patient_id) AS total_patients,

            SUM(
                appointment_date = CURDATE()
                AND status IN ('pending','confirmed')
            ) AS today,

            SUM(
                appointment_date > CURDATE()
                AND status IN ('pending','confirmed')
            ) AS upcoming,

            SUM(status='pending') AS pending,
            SUM(status='confirmed') AS confirmed,
            SUM(status='completed') AS completed,
            SUM(status='cancelled') AS cancelled

        FROM appointments
    ");

    $stmt->execute();

    $result = $stmt->get_result();
    $stats = $result->fetch_assoc();

    $result->free();
    $stmt->close();

    // Total consultations
    $stmt = $connection->prepare("
        SELECT COUNT(*)
        FROM consultations
    ");

    $stmt->execute();

    $stats['total_consultations'] =
        (int)$stmt->get_result()->fetch_row()[0];

    $stmt->close();

    // Total medical records
    $stmt = $connection->prepare("
        SELECT COUNT(*)
        FROM medical_records
    ");

    $stmt->execute();

    $stats['total_records'] =
        (int)$stmt->get_result()->fetch_row()[0];

    $stmt->close();

    foreach ($stats as $key => $value) {
        $stats[$key] = (int)($value ?? 0);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'OK',
        'data' => $stats
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'status' => 'error',
        'message' => 'Server error',
        'error' => $e->getMessage()
    ]);
}

exit();