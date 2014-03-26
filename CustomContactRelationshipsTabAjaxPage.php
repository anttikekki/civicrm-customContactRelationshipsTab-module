<?php

require_once "CustomContactRelationshipsTabUtil.php";

class CustomContactRelationshipsTabAjaxPage {
  public static function getData() {
    $contactId = (int) $_GET["contactId"];
    $result = [];
    
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