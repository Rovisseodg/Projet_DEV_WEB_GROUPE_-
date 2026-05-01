<?php
$db = new PDO('sqlite:C:\Users\daleo\OneDrive\Bureau\MaMutuelle\backend\database\database.sqlite');
$sql = file_get_contents('C:\Users\daleo\OneDrive\Bureau\MaMutuelle\backend\database\sqlite.sql');
$db->exec($sql);
echo "Tables créées!\n";
