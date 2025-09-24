<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=e_gov_bms;charset=utf8mb4', 'root', '');
$pdo->exec('DELETE FROM residents WHERE resident_id LIKE \'RES-%\'');
echo "Deleted existing test residents\n";