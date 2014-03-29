<?php

require_once "CustomContactRelationshipsTabUtil.php";
require_once "CustomContactRelationshipsTabAdminDAO.php";

/**
* Ajax request listener for Contact Relationship tab to return Custom field values for relationship.
* This listener URL is civicrm/ajax/customContactRelationshipsTabAjaxPage. This is configured in menu.xml.
*/
class Admin_Page_CustomContactRelationshipsTabAdminAjax {

  /**
  * Returns Custom values for all contact relationships. Also returns this extension configurations table content.
  * Prints JSON-response and terminates CiviCRM. Requires "contactId" GET parameter.
  *
  * Printed JSON object contains following fields: relationshipTypeForRelationshipId, customFieldValues, visibleCustomFieldsConfig, relationshipTypeIds and relationshipTypeNameForId.
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
  
  public static function getConfig() {
    echo json_encode(CustomContactRelationshipsTabUtil::getRelationshipVisibleCustomFieldsFromConfig());
    CRM_Utils_System::civiExit();
  }
  
  public static function saveConfigRow() {
    CustomContactRelationshipsTabAdminDAO::saveConfigRow($_GET);
    
    echo "ok";
    CRM_Utils_System::civiExit();
  }
  
  public static function deleteConfigRow() {
    CustomContactRelationshipsTabAdminDAO::deleteConfigRow($_GET);
    
    echo "ok";
    CRM_Utils_System::civiExit();
  }
}