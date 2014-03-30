<?php

require_once "CustomContactRelationshipsTabUtil.php";
require_once "CustomContactRelationshipsTabAdminDAO.php";

/**
* Ajax request listener for CustomContactRelationshipsTab Admin page Ajax calls.
* This listener methods intercept URLs in form civicrm/customContactRelationshipsTab/settings/ajax/*. This is configured in menu.xml.
* All methods print JSON-response and terminates CiviCRM.
*/
class Admin_Page_CustomContactRelationshipsTabAdminAjax {

  /**
  * Returns init data required by extension admin page.
  * Listens URL civicrm/customContactRelationshipsTab/settings/ajax/getInitData.
  *
  * Printed JSON object contains following fields:
  * config: all rows from civicrm_customContactRelationshipsTab_config table
  * customGroups: all custom groups that belong to Relationships
  * customFieldsForCustomGroups: all custom fields for all custom groups
  * relationshipTypes: Relationship types with id and name
  */
  public static function getInitData() {
    $result = array();
    $result["config"] = CustomContactRelationshipsTabUtil::getRelationshipVisibleCustomFieldsFromConfig();
    $result["customGroups"] = CustomContactRelationshipsTabUtil::getCustomGroupsForRelationshipTypes();
    $result["customFieldsForCustomGroups"] = CustomContactRelationshipsTabUtil::getCustomFieldsForCustomGroups($result["customGroups"]);
    $result["relationshipTypes"] = CustomContactRelationshipsTabUtil::getRelationshipTypes(NULL);
  
    echo json_encode($result);
    CRM_Utils_System::civiExit();
  }
  
  /**
  * Returns all rows from civicrm_customContactRelationshipsTab_config table.
  * Listens URL civicrm/customContactRelationshipsTab/settings/ajax/getConfig.
  */
  public static function getConfig() {
    echo json_encode(CustomContactRelationshipsTabUtil::getRelationshipVisibleCustomFieldsFromConfig());
    CRM_Utils_System::civiExit();
  }
  
  /**
  * Saves (creates or updates) configuration row in civicrm_customContactRelationshipsTab_config table.
  * Prints "ok" if save was succesfull. All other responses are error messages.
  * Listens URL civicrm/customContactRelationshipsTab/settings/ajax/saveConfigRow.
  *
  * Saved parameters are queried from $_GET.
  */
  public static function saveConfigRow() {
    echo CustomContactRelationshipsTabAdminDAO::saveConfigRow($_GET);
    CRM_Utils_System::civiExit();
  }
  
  /**
  * Deletes configuration row from civicrm_customContactRelationshipsTab_config table.
  * Prints "ok" if delete was succesfull.
  * Listens URL civicrm/customContactRelationshipsTab/settings/ajax/deleteConfigRow.
  *
  * Saved parameters are queried from $_GET.
  */
  public static function deleteConfigRow() {
    CustomContactRelationshipsTabAdminDAO::deleteConfigRow($_GET);
    
    echo "ok";
    CRM_Utils_System::civiExit();
  }
}