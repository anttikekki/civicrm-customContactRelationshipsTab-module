<?php

/**
* Custom Contact Relationships Tab hooks.
*/

require_once "CustomContactRelationshipsTabUtil.php";
require_once "CustomContactRelationshipsTabAjaxPage.php";

/**
* Implements CiviCRM 'install' hook.
*/
function customContactRelationshipsTab_civicrm_install() {  
  //Add table for configuration
  $sql = "
    CREATE TABLE IF NOT EXISTS civicrm_customContactRelationshipsTab_config (
      relationship_type_id int(10) NOT NULL,
      custom_field_id int(10) NOT NULL,
      display_order int(10) NOT NULL,
      PRIMARY KEY (relationship_type_id, custom_field_id)
    ) ENGINE=InnoDB;
  ";
  CRM_Core_DAO::executeQuery($sql);
}

/**
* Implemets CiviCRM 'alterTemplateFile' hook.
*
* @param String $formName Name of current form.
* @param CRM_Core_Form $form Current form.
* @param CRM_Core_Form $context Page or form.
* @param String $tplName The file name of the tpl - alter this to alter the file in use.
*/
function customContactRelationshipsTab_civicrm_alterTemplateFile($formName, &$form, $context, &$tplName) {
  //Contact summary main page
  if($form instanceof CRM_Contact_Page_View_Summary) {
    CRM_Core_Resources::singleton()->addScriptFile('com.github.anttikekki.customContactRelationshipsTab', 'customContactRelationshipsTab.js');
  }
}

function customContactRelationshipsTab_civicrm_config(&$config) {
  $include_path = dirname(__FILE__) . DIRECTORY_SEPARATOR . PATH_SEPARATOR . get_include_path();
  set_include_path($include_path);
}

function customContactRelationshipsTab_civicrm_xmlMenu( &$files ) {
  $files[] = dirname(__FILE__)."/menu.xml";
}