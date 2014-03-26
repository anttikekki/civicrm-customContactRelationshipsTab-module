<?php

/**
* Custom Contact Relationships Tab hooks.
*
* This extension modifies Contact Relationships tables by hiding originals and dividing rows for separate table based on Relationship type. 
* Every table shows custom field data spesific to that Relationship type.
*/

/**
* Implements CiviCRM 'install' hook.
*/
function customContactRelationshipsTab_civicrm_install() {  
  //Add table for configuration about relationship type visible custom fields in tab.
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
    /*
    * In Contact summary page CRM_Contact_Page_View_Relationship is loaded with AJAX so CRM_Core_Resources does not work 
    * directy. We need to inject JavaScript to main Summary page and listen tab change to init our own logic.
    */
    CRM_Core_Resources::singleton()->addScriptFile('com.github.anttikekki.customContactRelationshipsTab', 'customContactRelationshipsTab.js');
  }
  //Contact Relationship tab and Relationship edit & view
  else if($form instanceof CRM_Contact_Page_View_Relationship) {
    /*
    * CRM_Contact_Page_View_Relationship is displayed in full page mode when viewin and editing relationship. CRM_Core_Resources 
    * works so JavaScript can be injected directly.
    */
    $action = $form->getTemplate()->get_template_vars("action");
    if($action == CRM_Core_Action::VIEW || $action == CRM_Core_Action::UPDATE) {
      CRM_Core_Resources::singleton()->addScriptFile('com.github.anttikekki.customContactRelationshipsTab', 'customContactRelationshipsTab.js');
    }
  }
}

/**
* Implemets CiviCRM 'config' hook.
*
* @param object $config the config object
*/
function customContactRelationshipsTab_civicrm_config(&$config) {
  //Add extension folder to included folders list so that CustomContactRelationshipsTabAjaxPage.php is found whe accessin it from URL
  $include_path = dirname(__FILE__) . DIRECTORY_SEPARATOR . PATH_SEPARATOR . get_include_path();
  set_include_path($include_path);
}

/**
* Implemets CiviCRM 'xmlMenu' hook.
*
* @param array $files the array for files used to build the menu. You can append or delete entries from this file. You can also override menu items defined by CiviCRM Core.
*/
function customContactRelationshipsTab_civicrm_xmlMenu( &$files ) {
  $files[] = dirname(__FILE__)."/menu.xml";
}