<?php
/**
 * create_dummy_residents_fixed.php
 *
 * Add a small, deterministic set of dummy residents to the `residents` table.
 * Usage: php create_dummy_residents_fixed.php
 *
 * The script attempts to read DB connection settings from a .env file in the same
 * directory. If .env is not present it falls back to .env.example defaults.
 */

declare(strict_types=1);

function read_env(string $path): array {
    if (!is_file($path)) return [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $data = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (strpos($line, '=') === false) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        // remove surrounding quotes
        $v = preg_replace('/^"(.*)"$/', '$1', $v);
        $v = preg_replace("/^'(.*)'$/", '$1', $v);
        $data[$k] = $v;
    }
    return $data;
}

$env = read_env(__DIR__ . '/.env');
if (empty($env)) {
    $env = read_env(__DIR__ . '/.env.example');
}

$dbHost = $env['DB_HOST'] ?? '127.0.0.1';
$dbPort = $env['DB_PORT'] ?? '3306';
$dbName = $env['DB_DATABASE'] ?? 'e_gov_bms';
$dbUser = $env['DB_USERNAME'] ?? 'root';
$dbPass = $env['DB_PASSWORD'] ?? '';

echo "Using DB: {$dbUser}@{$dbHost}:{$dbPort}/{$dbName}\n";

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    echo "Failed to connect to database: " . $e->getMessage() . "\n";
    exit(1);
}

// Ensure the residents table exists
try {
    $res = $pdo->query("SHOW TABLES LIKE 'residents'")->fetch();
    if (!$res) {
        echo "Table `residents` not found in database {$dbName}. Make sure migrations have run.\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "Error checking for residents table: " . $e->getMessage() . "\n";
    exit(1);
}

$now = (new DateTime())->format('Y-m-d H:i:s');

// Helper to compute a timestamp for N months ago (useful to craft Active/Outdated statuses)
function monthsAgo(int $months): string {
    $dt = new DateTime();
    if ($months > 0) {
        $dt->modify("-{$months} months");
    }
    return $dt->format('Y-m-d H:i:s');
}

// Per-resident status overrides (keeps dummy array unchanged).
// We set last_modified and for_review plus created_at/updated_at so the UI computes
// Active / Outdated / Needs Verification correctly.
$statusMap = [
    'RES-001' => ['last_modified' => monthsAgo(1),  'for_review' => 0, 'created_at' => monthsAgo(13), 'updated_at' => monthsAgo(1)],
    'RES-002' => ['last_modified' => monthsAgo(8),  'for_review' => 0, 'created_at' => monthsAgo(9),  'updated_at' => monthsAgo(8)],
    'RES-003' => ['last_modified' => null,          'for_review' => 0, 'created_at' => monthsAgo(24), 'updated_at' => monthsAgo(24)],
    'RES-004' => ['last_modified' => monthsAgo(14), 'for_review' => 1, 'created_at' => monthsAgo(36), 'updated_at' => monthsAgo(14)],
    'RES-005' => ['last_modified' => monthsAgo(3),  'for_review' => 0, 'created_at' => monthsAgo(4),  'updated_at' => monthsAgo(3)],
    'RES-006' => ['last_modified' => monthsAgo(7),  'for_review' => 0, 'created_at' => monthsAgo(8),  'updated_at' => monthsAgo(7)],
    'RES-007' => ['last_modified' => monthsAgo(13), 'for_review' => 0, 'created_at' => monthsAgo(13), 'updated_at' => monthsAgo(13)],
    'RES-008' => ['last_modified' => monthsAgo(2),  'for_review' => 0, 'created_at' => monthsAgo(36), 'updated_at' => monthsAgo(2)],
];

$dummy = [
    // id fields: resident_id must be unique
    [
        'resident_id' => 'RES-001', 'first_name' => 'Juan', 'middle_name' => 'D', 'last_name' => 'Dela Cruz',
        'name_suffix' => null, 'birth_date' => '1985-04-12', 'birth_place' => 'Brgy. Uno', 'age' => 40,
        'nationality' => 'Filipino', 'sex' => 'Male', 'civil_status' => 'Married', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Head', 'email' => 'juan.dc@example.com', 'mobile_number' => '09171234567',
        'full_address' => '123 Barangay Uno, City', 'years_in_barangay' => 10, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1001', 'voting_location' => 'Precinct 1', 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 1, 'household_no' => 'HH-001',
        'classified_sector' => 'Private', 'educational_attainment' => 'College', 'occupation_type' => 'Employee',
        'salary_income' => '20000', 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode(['senior']), 'covid_vaccine_status' => 'Fully Vaccinated',
        'vaccine_received' => json_encode(['Sinovac']), 'other_vaccine' => null, 'year_vaccinated' => '2021'
    ],
    [
        'resident_id' => 'RES-002', 'first_name' => 'Maria', 'middle_name' => 'L', 'last_name' => 'Santos',
        'name_suffix' => null, 'birth_date' => '1992-08-03', 'birth_place' => 'Brgy. Dos', 'age' => 32,
        'nationality' => 'Filipino', 'sex' => 'Female', 'civil_status' => 'Single', 'religion' => 'Islam',
        'relation_to_head' => 'Daughter', 'email' => 'maria.santos@example.com', 'mobile_number' => '09171234568',
        'full_address' => '45 Barangay Dos, City', 'years_in_barangay' => 5, 'voter_status' => 'unregistered',
        'voters_id_number' => null, 'voting_location' => null, 'avatar' => null,
        'housing_type' => 'Apartment', 'head_of_family' => 0, 'household_no' => 'HH-002',
        'classified_sector' => 'Student', 'educational_attainment' => 'Senior High', 'occupation_type' => 'Student',
        'salary_income' => null, 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode([]), 'covid_vaccine_status' => 'Partially Vaccinated',
        'vaccine_received' => json_encode(['AstraZeneca']), 'other_vaccine' => null, 'year_vaccinated' => '2022'
    ],
    [
        'resident_id' => 'RES-003', 'first_name' => 'Pedro', 'middle_name' => null, 'last_name' => 'Reyes',
        'name_suffix' => null, 'birth_date' => '2012-02-20', 'birth_place' => 'Brgy. Tres', 'age' => 13,
        'nationality' => 'Filipino', 'sex' => 'Male', 'civil_status' => 'Single', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Child', 'email' => 'pedro.reyes@example.com', 'mobile_number' => '09171234569',
        'full_address' => '78 Barangay Tres, City', 'years_in_barangay' => 2, 'voter_status' => 'unregistered',
        'voters_id_number' => null, 'voting_location' => null, 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 0, 'household_no' => 'HH-003',
        'classified_sector' => 'Youth', 'educational_attainment' => 'Elementary', 'occupation_type' => null,
        'salary_income' => null, 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode([]), 'covid_vaccine_status' => null,
        'vaccine_received' => json_encode([]), 'other_vaccine' => null, 'year_vaccinated' => null
    ],
    [
        'resident_id' => 'RES-004', 'first_name' => 'Ana', 'middle_name' => 'M', 'last_name' => 'Lopez',
        'name_suffix' => null, 'birth_date' => '1970-11-15', 'birth_place' => 'Brgy. Apat', 'age' => 54,
        'nationality' => 'Filipino', 'sex' => 'Female', 'civil_status' => 'Widowed', 'religion' => 'Iglesia',
        'relation_to_head' => 'Head', 'email' => 'ana.lopez@example.com', 'mobile_number' => '09171234570',
        'full_address' => '12 Barangay Apat, City', 'years_in_barangay' => 30, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1004', 'voting_location' => 'Precinct 3', 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 1, 'household_no' => 'HH-004',
        'classified_sector' => 'Senior', 'educational_attainment' => 'High School', 'occupation_type' => 'Retired',
        'salary_income' => null, 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode(['senior']), 'covid_vaccine_status' => 'Fully Vaccinated',
        'vaccine_received' => json_encode(['Pfizer']), 'other_vaccine' => null, 'year_vaccinated' => '2021'
    ],
    [
        'resident_id' => 'RES-005', 'first_name' => 'Lito', 'middle_name' => 'S', 'last_name' => 'Garcia',
        'name_suffix' => null, 'birth_date' => '1998-06-22', 'birth_place' => 'Brgy. Lima', 'age' => 27,
        'nationality' => 'Filipino', 'sex' => 'Male', 'civil_status' => 'Single', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Son', 'email' => 'lito.garcia@example.com', 'mobile_number' => '09171234571',
        'full_address' => '9 Barangay Lima, City', 'years_in_barangay' => 8, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1005', 'voting_location' => 'Precinct 2', 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 0, 'household_no' => 'HH-005',
        'classified_sector' => 'Private', 'educational_attainment' => 'College', 'occupation_type' => 'Self-Employed',
        'salary_income' => '15000', 'business_info' => 'Tricycle driver', 'business_type' => 'Transportation', 'business_location' => 'City',
        'business_outside_barangay' => 0, 'special_categories' => json_encode([]), 'covid_vaccine_status' => 'Fully Vaccinated',
        'vaccine_received' => json_encode(['Sputnik']), 'other_vaccine' => null, 'year_vaccinated' => '2022'
    ],
    // Add a few more residents to ensure analytics have enough variety
    [
        'resident_id' => 'RES-006', 'first_name' => 'Grace', 'middle_name' => 'P', 'last_name' => 'Tan',
        'name_suffix' => null, 'birth_date' => '1989-03-12', 'birth_place' => 'Brgy. Anim', 'age' => 36,
        'nationality' => 'Filipino', 'sex' => 'Female', 'civil_status' => 'Married', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Wife', 'email' => 'grace.tan@example.com', 'mobile_number' => '09171234572',
        'full_address' => '22 Barangay Anim, City', 'years_in_barangay' => 6, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1006', 'voting_location' => 'Precinct 4', 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 0, 'household_no' => 'HH-006',
        'classified_sector' => 'Private', 'educational_attainment' => 'College', 'occupation_type' => 'Nurse',
        'salary_income' => '22000', 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode([]), 'covid_vaccine_status' => 'Fully Vaccinated',
        'vaccine_received' => json_encode(['Pfizer']), 'other_vaccine' => null, 'year_vaccinated' => '2021'
    ],
    [
        'resident_id' => 'RES-007', 'first_name' => 'Ronaldo', 'middle_name' => 'B', 'last_name' => 'Cruz',
        'name_suffix' => null, 'birth_date' => '2000-12-01', 'birth_place' => 'Brgy. Pito', 'age' => 24,
        'nationality' => 'Filipino', 'sex' => 'Male', 'civil_status' => 'Single', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Son', 'email' => 'ronaldo.cruz@example.com', 'mobile_number' => '09171234573',
        'full_address' => '3 Barangay Pito, City', 'years_in_barangay' => 3, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1007', 'voting_location' => 'Precinct 1', 'avatar' => null,
        'housing_type' => 'Apartment', 'head_of_family' => 0, 'household_no' => 'HH-007',
        'classified_sector' => 'Private', 'educational_attainment' => 'College', 'occupation_type' => 'Engineer',
        'salary_income' => '30000', 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode([]), 'covid_vaccine_status' => 'Not Vaccinated',
        'vaccine_received' => json_encode([]), 'other_vaccine' => null, 'year_vaccinated' => null
    ],
    [
        'resident_id' => 'RES-008', 'first_name' => 'Noel', 'middle_name' => 'T', 'last_name' => 'Diaz',
        'name_suffix' => null, 'birth_date' => '1965-09-09', 'birth_place' => 'Brgy. Walo', 'age' => 59,
        'nationality' => 'Filipino', 'sex' => 'Male', 'civil_status' => 'Married', 'religion' => 'Roman Catholic',
        'relation_to_head' => 'Head', 'email' => 'noel.diaz@example.com', 'mobile_number' => '09171234574',
        'full_address' => '88 Barangay Walo, City', 'years_in_barangay' => 40, 'voter_status' => 'registered',
        'voters_id_number' => 'VOTER-1008', 'voting_location' => 'Precinct 3', 'avatar' => null,
        'housing_type' => 'House', 'head_of_family' => 1, 'household_no' => 'HH-008',
        'classified_sector' => 'Senior', 'educational_attainment' => 'Elementary', 'occupation_type' => 'Farmer',
        'salary_income' => null, 'business_info' => null, 'business_type' => null, 'business_location' => null,
        'business_outside_barangay' => 0, 'special_categories' => json_encode(['senior']), 'covid_vaccine_status' => 'Fully Vaccinated',
        'vaccine_received' => json_encode(['Moderna']), 'other_vaccine' => null, 'year_vaccinated' => '2021'
    ],
];

// Based on the status data, compute appropriate verification_status
$verificationStatusMap = [
    'RES-001' => 'approved',     // Active
    'RES-002' => 'pending',      // Outdated
    'RES-003' => 'pending',      // Needs Verification
    'RES-004' => 'pending',      // For Review
    'RES-005' => 'approved',     // Active
    'RES-006' => 'pending',      // Outdated
    'RES-007' => 'denied',       // Needs Verification
    'RES-008' => 'approved',     // Active
];

// Extend insert SQL to include last_modified and for_review and created_at/updated_at
$insertSql = <<<SQL
INSERT INTO residents (
    user_id, resident_id, first_name, middle_name, last_name, name_suffix, birth_date, birth_place,
    age, nationality, sex, civil_status, religion, relation_to_head, email, mobile_number, current_address,
    years_in_barangay, voter_status, voters_id_number, voting_location, current_photo, housing_type, head_of_family,
    household_no, classified_sector, educational_attainment, occupation_type, salary_income, business_info,
    business_type, business_location, business_outside_barangay, special_categories, covid_vaccine_status,
    vaccine_received, other_vaccine, year_vaccinated, verification_status, last_modified, for_review, created_at, updated_at
)
VALUES (
    :user_id, :resident_id, :first_name, :middle_name, :last_name, :name_suffix, :birth_date, :birth_place,
    :age, :nationality, :sex, :civil_status, :religion, :relation_to_head, :email, :mobile_number, :current_address,
    :years_in_barangay, :voter_status, :voters_id_number, :voting_location, :current_photo, :housing_type, :head_of_family,
    :household_no, :classified_sector, :educational_attainment, :occupation_type, :salary_income, :business_info,
    :business_type, :business_location, :business_outside_barangay, :special_categories, :covid_vaccine_status,
    :vaccine_received, :other_vaccine, :year_vaccinated, :verification_status, :last_modified, :for_review, :created_at, :updated_at
)
ON DUPLICATE KEY UPDATE id=id;
SQL;

$stmt = $pdo->prepare($insertSql);

$added = 0;
foreach ($dummy as $row) {
    // skip if resident with same resident_id exists
    $check = $pdo->prepare('SELECT id FROM residents WHERE resident_id = :rid LIMIT 1');
    $check->execute([':rid' => $row['resident_id']]);
    if ($check->fetch()) {
        echo "Skipping existing {$row['resident_id']}\n";
        continue;
    }

    $params = [
        ':user_id' => null,
        ':resident_id' => $row['resident_id'],
        ':first_name' => $row['first_name'],
        ':middle_name' => $row['middle_name'],
        ':last_name' => $row['last_name'],
        ':name_suffix' => $row['name_suffix'],
        ':birth_date' => $row['birth_date'],
        ':birth_place' => $row['birth_place'],
        ':age' => $row['age'],
        ':nationality' => $row['nationality'],
        ':sex' => $row['sex'],
        ':civil_status' => $row['civil_status'],
        ':religion' => $row['religion'],
        ':relation_to_head' => $row['relation_to_head'],
        ':email' => $row['email'],
        ':mobile_number' => $row['mobile_number'],
        ':current_address' => $row['full_address'],
        ':years_in_barangay' => $row['years_in_barangay'],
        ':voter_status' => $row['voter_status'],
        ':voters_id_number' => $row['voters_id_number'],
        ':voting_location' => $row['voting_location'],
        ':current_photo' => null,
        ':housing_type' => $row['housing_type'],
        ':head_of_family' => $row['head_of_family'],
        ':household_no' => $row['household_no'],
        ':classified_sector' => $row['classified_sector'],
        ':educational_attainment' => $row['educational_attainment'],
        ':occupation_type' => $row['occupation_type'],
        ':salary_income' => $row['salary_income'],
        ':business_info' => $row['business_info'],
        ':business_type' => $row['business_type'],
        ':business_location' => $row['business_location'],
        ':business_outside_barangay' => $row['business_outside_barangay'],
        ':special_categories' => $row['special_categories'],
        ':covid_vaccine_status' => $row['covid_vaccine_status'],
        ':vaccine_received' => $row['vaccine_received'],
        ':other_vaccine' => $row['other_vaccine'],
            ':year_vaccinated' => $row['year_vaccinated'],
            ':verification_status' => isset($verificationStatusMap[$row['resident_id']]) ? $verificationStatusMap[$row['resident_id']] : 'Pending',
            ':last_modified' => isset($statusMap[$row['resident_id']]) ? $statusMap[$row['resident_id']]['last_modified'] : $now,
            ':for_review' => isset($statusMap[$row['resident_id']]) ? $statusMap[$row['resident_id']]['for_review'] : 0,
            ':created_at' => isset($statusMap[$row['resident_id']]) ? $statusMap[$row['resident_id']]['created_at'] : $now,
            ':updated_at' => isset($statusMap[$row['resident_id']]) ? $statusMap[$row['resident_id']]['updated_at'] : $now,
    ];

    try {
        $stmt->execute($params);
        $added++;
        echo "Added {$row['resident_id']}\n";
    } catch (Exception $e) {
        echo "Failed to insert {$row['resident_id']}: " . $e->getMessage() . "\n";
    }
}

echo "Done. Added {$added} new resident(s).\n";

exit(0);
