<?php

require_once "CustomContactRelationshipsTabUtil.php";

/**
* Ajax request listener for Contact Relationship tab to return Custom field values for relationship.
* This listener URL is civicrm/ajax/customContactRelationshipsTabAjaxPage. This is configured in menu.xml.
*/
class CustomContactRelationshipsTabAjax {

  /**
  * Returns Custom values for all contact relationships. Also returns this extension configurations table content.
  * Prints JSON-response and terminates CiviCRM. Requires "contactId" GET parameter.
  *
  * Printed JSON object contains following fields: relationshipTypeForRelationshipId, customFieldValues, visibleCustomFieldsConfig, relationshipTypeIds and relationshipTypeNameForId.
  */
  public static function getData() {
    $contactId = (int) $_GET["contactId"];
    $result = array();
    
    //Add Contact relationships
    $relationshipTypeForRelationshipId = CustomContactRelationshipsTabUtil::getRelationshipsForContactId($contactId);
    $result["relationshipTypeForRelationshipId"] = $relationshipTypeForRelationshipId;
     
    //Add relationships custom field values
    $customFieldValues = CustomContactRelationshipsTabUtil::getRelationshipTypeCustomFieldsValues(array_keys($relationshipTypeForRelationshipId));
    $result["customFieldValues"] = $customFieldValues;
    
    //Add visible custom field configs
    $visibleCustomFieldsConfig = CustomContactRelationshipsTabUtil::getRelationshipVisibleCustomFieldsFromConfig();
    $result["visibleCustomFieldsConfig"] = $visibleCustomFieldsConfig;
    
    //Add relationship type ids
    $result["relationshipTypeIds"] = array_unique(array_values($relationshipTypeForRelationshipId));
    
    //Add relationship types
    $relationshipTypeNameForId = CustomContactRelationshipsTabUtil::getRelationshipTypes(array_values($relationshipTypeForRelationshipId));
    $result["relationshipTypeNameForId"] = $relationshipTypeNameForId;
  
    echo json_encode($result);
    CRM_Utils_System::civiExit();
  }
}