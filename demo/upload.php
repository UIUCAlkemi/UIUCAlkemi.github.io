<?php
header('Content-Type: application/json');

$upload = array();

if(!empty($_FILES['file']['name'][0])) {

	foreach($_FILES['file']['name'] as $position => $name) {
		move_uploaded_file($_FILES['file']['tmp_name'][$position], 'data.json');
	}
}
